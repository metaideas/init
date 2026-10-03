import { initLogger } from "@init/observability/logger"
import { buildDrain } from "@init/observability/logger/drains"
import { isDevelopment } from "@init/utils/env"

const drain = buildDrain()

// Debug events (per-query SQL among them) stay out of the drain in production.
initLogger({ drain, env: { service: "api" }, minLevel: isDevelopment ? "debug" : "info" })

export async function flushLogs() {
  await drain?.flush()
}

export { log } from "@init/observability/logger"
