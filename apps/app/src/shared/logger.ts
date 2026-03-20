import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:app", () =>
  buildLogger([LoggerCategory.DEFAULT], {
    async: !("window" in globalThis),
    isDevelopment: import.meta.env.DEV,
  })
)
