import { createLogger } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:app", () =>
  createLogger({
    isDevelopment: import.meta.env.DEV,
    service: "app",
  })
)
