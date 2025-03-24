import "server-only"

import { geolocation, ipAddress } from "@vercel/functions"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { headers } from "next/headers"

import { db } from "@init/db"
import { captureException } from "@init/observability/error/nextjs"
import { logger } from "@init/observability/logger"
import { createRateLimiter } from "@init/security/ratelimit"
import { Fault } from "@init/utils/fault"
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

    // If the error is a Fault, return the public message
    if (e instanceof Fault) {
      return e.message
    }

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
    throw Fault.from("Missing Session")
      .withTag("AUTHENTICATION_ERROR")
      .withDescription(
        "Session not found in request",
        "You must be logged in to perform this action"
      )
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
      throw Fault.from("Rate Limit Exceeded")
        .withTag("RATE_LIMIT_EXCEEDED")
        .withMetadata("reason", limit.reason)
        .withDescription(
          `Rate limit exceeded for IP: ${ip}`,
          `Please try again in ${Math.ceil(limit.reset / 1000)} seconds`
        )
    }

    return next({ ctx })
  })
}
