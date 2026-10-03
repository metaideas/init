import { auditRedactPreset, initLogger } from "evlog"

// The preset masks exact field names such as `secret` and `apiKey`. These globs also mask
// credentials inside longer names, such as `clientSecret`, `AUTH_SECRET`, and `api_key`, in each
// casing, because evlog's globs are case-sensitive.
const CREDENTIAL_PATHS = ["secret", "token", "password", "apiKey", "api_key"].flatMap((word) => [
  `*${word}*`,
  `*${word.charAt(0).toUpperCase()}${word.slice(1)}*`,
  `*${word.toUpperCase()}*`,
])

initLogger({
  env: { service: "desktop" },
  pretty: import.meta.env.DEV,
  redact: {
    ...auditRedactPreset,
    paths: [...(auditRedactPreset.paths ?? []), ...CREDENTIAL_PATHS],
  },
})

export { log } from "evlog"
