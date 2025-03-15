import { geolocation, ipAddress } from "@vercel/functions"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { headers } from "next/headers"

import { db } from "@this/db"
import { createRateLimiter, slidingWindow } from "@this/kv/ratelimit"
import { AuthError, RateLimitError } from "@this/observability/error"
import { captureException } from "@this/observability/error/nextjs"
import { logger } from "@this/observability/logger"
import * as z from "@this/utils/schema"

import { validateRequest } from "~/shared/auth/server"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      name: z.string(),
    }),
  handleServerError(e, utils) {
    captureException(e, {
      data: {
        metadata: utils.metadata,
      },
    })

    return e.message || DEFAULT_SERVER_ERROR_MESSAGE
  },
})
  // Inject dependencies to the action context
  .use(({ next, metadata }) => {
    const requestId = crypto.randomUUID()
    const childLogger = logger.child({
      action: metadata.name,
      requestId,
    })

    return next({ ctx: { logger: childLogger, db } })
  })
  // Logging middleware for action
  .use(async ({ next, metadata }) => {
    const startTime = performance.now()

    const result = await next()
    const endTime = performance.now()
    const durationMs = endTime - startTime

    const headersList = await headers()
    const [ip, geo] = await Promise.all([
      ipAddress({ headers: headersList }),
      geolocation({ headers: headersList }),
    ])

    const actionContext = {
      metadata,
      durationMs,
      ip,
      ...geo,
    }

    if (result.success) {
      logger.info(
        { ...actionContext },
        `Action "${metadata.name}" succeeded in ${durationMs}ms`
      )
    } else {
      logger.error(
        {
          ...actionContext,
          errors: {
            server: result.serverError,
            validation: result.validationErrors,
            bindArgsValidation: result.bindArgsValidationErrors,
          },
        },
        `Action "${metadata.name}" failed in ${durationMs}ms`
      )
    }

    return result
  })

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await validateRequest()

  if (!session) {
    throw new AuthError("Session not found")
  }

  return next({ ctx: { ...session } })
})

export function withRateLimitByIp(
  ...options: Parameters<typeof slidingWindow>
) {
  const rateLimiter = createRateLimiter("ip", {
    limiter: slidingWindow(...options),
  })

  return createMiddleware().define(async ({ next, ctx }) => {
    const ip = await ipAddress({ headers: await headers() })

    // If the IP address is not found, skip the rate limit
    if (!ip) {
      return next({ ctx })
    }

    const limit = await rateLimiter.limit(ip)

    if (!limit.success) {
      throw new RateLimitError(`Rate limit exceeded for IP ${ip}`)
    }

    return next({ ctx })
  })
}
