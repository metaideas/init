import { auditRedactPreset, initLogger } from "evlog"

initLogger({
  env: { service: "desktop" },
  pretty: import.meta.env.DEV,
  redact: auditRedactPreset,
})

export { log } from "evlog"
