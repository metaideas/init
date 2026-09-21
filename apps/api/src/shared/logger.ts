import { initLogger } from "@init/observability/logger"
import { buildDrain } from "@init/observability/logger/drains"
import { isDevelopment } from "@init/utils/env"

const drain = buildDrain()

// Debug events (per-query SQL among them) stay out of the drain in production.
initLogger({ drain, env: { service: "api" }, minLevel: isDevelopment ? "debug" : "info" })

if (drain) {
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void drain.flush().finally(() => process.exit(0))
    })
  }
}

export { log } from "@init/observability/logger"
