import { AuthError, RateLimitError } from "@this/common/errors"
import { createRateLimiter, slidingWindow } from "@this/kv/ratelimit"
import { reportError } from "@this/observability/instrumentation/error"
import { logger } from "@this/observability/logger"
import {
  type Logger,
  createActionLogger,
} from "@this/observability/logger/nextjs"
import { ActionMetadataSchema } from "@this/validation/actions"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createMiddleware,
  createSafeActionClient,
} from "next-safe-action"
import { validateRequest } from "~/lib/auth/server"
import { getIpAddress } from "~/lib/utils/headers"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => ActionMetadataSchema,
  handleServerError(e, utils) {
    const ctx = utils.ctx as { log: Logger }

    const { sentryId, message } = reportError(e, ctx.log)

    logger.error(message)
    ctx.log.error(message, { sentryId })

    return e.message || DEFAULT_SERVER_ERROR_MESSAGE
  },
}).use(async ({ next, metadata }) => {
  const logger = createActionLogger(metadata)

  const result = await next({ ctx: { log: logger.log } })

  logger.flush(result.success)

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
    const ip = await getIpAddress()

    const limit = await rateLimiter.limit(ip)

    if (!limit.success) {
      throw new RateLimitError(`Rate limit exceeded for IP ${ip}`)
    }

    return next({ ctx })
  })
}
