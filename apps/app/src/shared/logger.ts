import { initLogger } from "@init/observability/logger"

initLogger({ env: { service: "app" }, pretty: import.meta.env.DEV })

export { log } from "@init/observability/logger"
