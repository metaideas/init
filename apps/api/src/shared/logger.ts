import { createLogger } from "@init/observability/logger"
import { buildDrain } from "@init/observability/logger/drains"
import { singleton } from "@init/utils/singleton"

export const drain = singleton("drain:api", () => buildDrain())

export const logger = singleton("logger:api", () => createLogger({ drain, service: "api" }))
