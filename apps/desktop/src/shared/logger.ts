import { initLogger } from "@init/observability/logger"

initLogger({ env: { service: "desktop" }, pretty: import.meta.env.DEV })

export { log } from "@init/observability/logger"
