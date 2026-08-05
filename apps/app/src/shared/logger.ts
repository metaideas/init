import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { hasWindow } from "@init/utils/env"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:app", () =>
  buildLogger([LoggerCategory.DEFAULT], {
    async: !hasWindow,
    isDevelopment: import.meta.env.DEV,
  })
)
