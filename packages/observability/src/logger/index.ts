import type { LoggerConfig } from "evlog"
import { isDevelopment } from "@init/utils/env"
import { EvlogError, initLogger as configure } from "evlog"

/**
 * The logger, shared by every app and package. It is process-wide: apps configure it once at
 * startup with `initLogger` (from their `#shared/logger.ts`) and everything else just imports it.
 */
export { log } from "evlog"

const SECRET_WORDS = [
  "secret",
  "password",
  "passphrase",
  "passcode",
  "token",
  "apikey",
  "api_key",
  "api-key",
]

/**
 * Field names masked in every environment, on top of evlog's value-based builtins (emails, JWTs,
 * card numbers, ...), which stay production-only. A bare word matches the whole key in any casing;
 * evlog's key globs are case-sensitive, so each word is also globbed in the casings it takes inside
 * a longer key (`accessToken`, `CLIENT_SECRET`).
 */
const REDACTED_FIELDS = SECRET_WORDS.flatMap((word) => [
  word,
  `*${word}*`,
  `*${word.charAt(0).toUpperCase()}${word.slice(1)}*`,
  `*${word.toUpperCase()}*`,
])

/**
 * Configure the logger for an app. Call once at startup; the configuration is process-wide and
 * last-call-wins. Server apps pass `buildDrain()` from `#logger/drains.ts` as `drain`.
 *
 * Secret-shaped fields are redacted by default; pass `redact` to override.
 */
export function initLogger(config: LoggerConfig) {
  configure({
    redact: { paths: REDACTED_FIELDS, ...(isDevelopment ? { builtins: false } : {}) },
    ...config,
  })
}

/**
 * Open a request-scoped wide event where evlog has no framework integration (e.g. TanStack Start
 * request middleware). Accumulate context with `set()` and call `emit()` when the response is ready
 * — emitted events ship through the drain configured by `initLogger`.
 */
export { createRequestLogger } from "evlog"

export { createError, parseError } from "evlog"

/**
 * True for errors raised deliberately through `createError`. Only these carry a `message`, `why`
 * and `fix` written for the caller; anything else may hold internal detail and must not be echoed
 * in a response.
 */
export function isStructuredError(error: unknown) {
  return EvlogError.isEvlogError(error)
}
export type { DrainContext, Log, LoggerConfig, ParsedError, RequestLogger, WideEvent } from "evlog"
