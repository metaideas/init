import { createLogger } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"

export const logger = singleton("logger:mobile", () => createLogger({ service: "mobile" }))
