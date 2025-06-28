import "server-only"

import { AuthError } from "@init/auth/server"
import { type Database, database } from "@init/db/client"
import { type Redis, redis } from "@init/kv/client"
import { captureException } from "@init/observability/error/nextjs"
import type { Logger } from "@init/observability/logger"
import { createRateLimiter } from "@init/security/ratelimit"
import * as z from "@init/utils/schema"
import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import {
  createMiddleware,
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action"
import { type Auth, auth, validateRequest } from "~/shared/auth/server"
import { logger } from "~/shared/logger"

type ActionErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_SUPPORTED"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UNPROCESSABLE_CONTENT"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_IMPLEMENTED"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"
  | "GATEWAY_TIMEOUT"

type ActionContext = {
  auth: Auth
  db: Database
  kv: Redis
  logger: Logger
}

export class ActionError extends Error {
  code: ActionErrorCode
  metadata?: Record<string, unknown>
  publicMessage?: string

  constructor({
    cause,
    code,
    message,
    metadata,
    publicMessage,
  }: {
    message: string
    /**
     * The public message to display to the client. If not provided, the
     * default server error message will be used.
     */
    publicMessage?: string
    code?: ActionErrorCode
    cause?: unknown
    metadata?: Record<string, unknown>
  }) {
    super(message, { cause })
    this.code = code ?? "INTERNAL_SERVER_ERROR"
    this.metadata = metadata
    this.name = "ActionError"
    this.publicMessage = publicMessage
  }
}

export const publicAction = createSafeActionClient({
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

    if (e instanceof AuthError) {
      return e.message
    }

    // If the error is an ActionError, return the public message
    if (e instanceof ActionError && e.publicMessage) {
      return e.publicMessage
    }

    // Otherwise, return the default server error message, since we can't trust
    // that the error message is safe to display to the client
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})
  // Inject dependencies to the action context
  .use(({ next, metadata }) =>
    next({
      ctx: {
        auth,
        db: database(),
        kv: redis(),
        logger: logger.child({
          group: "action",
          action: metadata.name,
          requestId: crypto.randomUUID(),
        }),
      } satisfies ActionContext,
    })
  )
  // Logging middleware for action
  .use(async ({ next, metadata }) => {
    const startTime = performance.now()

    const result = await next()

    const duration = (performance.now() - startTime).toFixed(2)

    const headersList = await headers()
    const [ip, geo] = await Promise.all([
      ipAddress({ headers: headersList }),
      geolocation({ headers: headersList }),
    ])

    const actionContext = { metadata, duration, ip, geo }

    // Navigation redirects are considered successful
    if (result.success || result.navigationKind === "redirect") {
      logger.info(
        { ...actionContext },
        `Action "${metadata.name}" succeeded in ${duration}ms`
      )

      return result
    }

    logger.error(
      {
        ...actionContext,
        errors: {
          server: result.serverError,
          validation: result.validationErrors,
        },
      },
      `Action "${metadata.name}" failed in ${duration}ms`
    )

    return result
  })

export const protectedAction = publicAction.use(async ({ next }) => {
  const session = await validateRequest()

  if (!session) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Session not found in request",
      publicMessage: "You must be logged in to perform this action",
    })
  }

  return next({ ctx: { ...session } })
})

export function withRateLimitByIp(
  prefix: string,
  limiter: Parameters<typeof createRateLimiter>[1]["limiter"]
) {
  let rateLimiter: ReturnType<typeof createRateLimiter>

  return createMiddleware<{ ctx: ActionContext }>().define(
    async ({ next, ctx }) => {
      const ip = await ipAddress({ headers: await headers() })

      if (!rateLimiter) {
        rateLimiter = createRateLimiter(prefix, {
          limiter,
          redis: ctx.kv,
        })
      }

      const limit = await rateLimiter.limit(ip ?? "Unknown")

      if (!limit.success) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded for IP: ${ip}`,
          publicMessage: `Please try again in ${Math.ceil(limit.reset / 1000).toFixed(0)} seconds`,
        })
      }

      return next({ ctx })
    }
  )
}
