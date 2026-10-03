import { auditRedactPreset, initLogger } from "evlog"

initLogger({
  env: { service: "mobile" },
  redact: auditRedactPreset,
})

export { log } from "evlog"
