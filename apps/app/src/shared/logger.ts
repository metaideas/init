import { auditRedactPreset, initLogger } from "evlog"

initLogger({
  env: { service: "app" },
  pretty: import.meta.env.DEV,
  redact: auditRedactPreset,
})

export { log } from "evlog"
