import * as z from "zod/v4"

// Create custom zod types here and import them to other packages under the `z` namespace.

export function env() {
  return z.enum(["development", "production", "test"])
}

const PROTOCOL_REGEX = /^https?$/

/**
 * Specifically for web URLs. Doesn't support localhost:port style URLs.
 */
export function httpUrl() {
  return z.url({
    protocol: PROTOCOL_REGEX,
    hostname: z.regexes.domain,
  })
}

export * as form from "zod-form-data"
export * from "zod/v4"
