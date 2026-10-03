import { isDevelopment } from "@init/utils/env"
import { auditRedactPreset, initLogger } from "evlog"

initLogger({
  env: { service: "api" },
  minLevel: isDevelopment ? "debug" : "info",
  redact: auditRedactPreset,
})

export { log } from "evlog"
