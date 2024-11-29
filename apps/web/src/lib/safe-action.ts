import { reportError } from "@this/observability/error"
import {
  type Logger,
  createActionLogger,
} from "@this/observability/logger/nextjs"
import { ActionMetadataSchema } from "@this/validation/actions"
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action"

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => ActionMetadataSchema,
  handleServerError(e, utils) {
    const ctx = utils.ctx as { log: Logger }

    const { sentryId, message } = reportError(e)

    ctx.log.error(message, {
      sentryId,
    })

    return DEFAULT_SERVER_ERROR_MESSAGE
  },
}).use(async ({ next, metadata }) => {
  const logger = createActionLogger(metadata)

  const result = await next({ ctx: { log: logger.log } })

  logger.flush(result.success)

  return result
})
