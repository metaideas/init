import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:api", () =>
  buildLogger(
    [
      LoggerCategory.DEFAULT,
      LoggerCategory.EMAIL,
      LoggerCategory.LOGTAPE,
      LoggerCategory.HONO,
      LoggerCategory.DRIZZLE_ORM,
      LoggerCategory.INNGEST,
    ],
    { async: true }
  )
)

export { LoggerCategory }
