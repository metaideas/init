import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"

import { createRateLimiter, slidingWindow } from "@this/kv/ratelimit"
import { AuthError, RateLimitError } from "@this/observability/error"
import { captureException } from "@this/observability/error/nextjs"
import { logger } from "@this/observability/logger"

import * as z from "@this/utils/schema"

import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
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
  // Logging middleware for action
  .use(async ({ next, metadata }) => {
    const requestId = crypto.randomUUID()
    const childLogger = logger.child({
      action: metadata.name,
      requestId,
    })

    const startTime = performance.now()
    const result = await next({ ctx: { logger: childLogger } })
    const endTime = performance.now()
    const durationMs = endTime - startTime

    const headersList = await headers()
    const [ip, geo] = await Promise.all([
      ipAddress({ headers: headersList }),
      geolocation({ headers: headersList }),
    ])

    if (result.success) {
      logger.info(
        {
          metadata,
          durationMs,
          ip,
          requestId,
          ...geo,
        },
        `Action "${metadata.name}" succeeded in ${durationMs}ms`
      )
    } else {
      logger.error(
        { metadata, durationMs, ip, ...geo },
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
