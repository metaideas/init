import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:extension", () =>
  buildLogger([LoggerCategory.DEFAULT], {
    isDevelopment: import.meta.env.DEV,
  })
)
