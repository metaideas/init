import { initLogger } from "@init/observability/logger"
import { buildDrain } from "@init/observability/logger/drains"

initLogger({ drain: buildDrain(), env: { service: "api" } })

export { log } from "@init/observability/logger"
