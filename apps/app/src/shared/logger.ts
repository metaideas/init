import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { hasWindow } from "std-env"

export const logger = singleton("logger:app", () =>
  buildLogger([LoggerCategory.DEFAULT], {
    async: !hasWindow,
    isDevelopment: import.meta.env.DEV,
  })
)
