import "server-only"

import { geolocation, ipAddress } from "@vercel/functions"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { headers } from "next/headers"

import { db } from "@init/db"
import { AuthError, RateLimitError } from "@init/observability/error"
import { captureException } from "@init/observability/error/nextjs"
import { logger } from "@init/observability/logger"
import { createRateLimiter } from "@init/security/ratelimit"
import * as z from "@init/utils/schema"

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
  prefix: string,
  limiter: Parameters<typeof createRateLimiter>[1]["limiter"]
) {
  const rateLimiter = createRateLimiter(prefix, { limiter })

  return createMiddleware().define(async ({ next, ctx }) => {
    const ip = await ipAddress({ headers: await headers() })

    const limit = await rateLimiter.limit(ip ?? "Unknown")

    if (!limit.success) {
      throw new RateLimitError(`Rate limit exceeded for IP ${ip}`)
    }

    return next({ ctx })
  })
}
