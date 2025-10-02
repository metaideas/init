import * as z from "zod"

// Create custom zod types here and import them to other packages under the `z` namespace.

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

export function env() {
  return z.enum(["development", "production", "test"])
}

export function branded<T extends string>(_: T) {
  return z.string().brand<T>()
}

/**
 * Validates IPv4 and IPv6 addresses.
 */
export function ip() {
  return z.union([z.ipv4(), z.ipv6()])
}

export * from "zod"
export * as form from "zod-form-data"
