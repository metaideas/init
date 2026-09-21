import { initLogger } from "@init/observability/logger"

initLogger({ env: { service: "mobile" } })

export { log } from "@init/observability/logger"
