import { initLogger } from "@init/observability/logger"

initLogger({ env: { service: "extension" }, pretty: import.meta.env.DEV })

export { log } from "@init/observability/logger"
