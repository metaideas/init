import type { DrainContext, Log, RedactConfig } from "evlog"
import { initLogger, log } from "evlog"

type CreateLoggerOptions = {
  /** Service name stamped on every event. */
  service: string
  /** Overrides evlog's environment auto-detection (pretty output, redaction defaults). */
  isDevelopment?: boolean
  /** Ships emitted events to external services. Build one with `buildDrain()` from `#logger/drains.ts`. */
  drain?: (ctx: DrainContext) => void | Promise<void>
  /** PII redaction. Defaults to evlog's built-ins (on in production, off in development). */
  redact?: boolean | RedactConfig
}

/**
 * Configure evlog for this app and return the logger. Call once at startup,
 * wrapped in `singleton` from `@init/utils/singleton`.
 *
 * The configuration is process-wide and last-call-wins, so each app must call
 * this exactly once. Framework integrations that auto-initialize (the Vite
 * plugin, Nitro module) detect an existing configuration and skip their own.
 */
export function createLogger(options: CreateLoggerOptions) {
  const { service, isDevelopment, drain, redact } = options

  initLogger({
    env: { service },
    ...(isDevelopment === undefined ? {} : { pretty: isDevelopment }),
    ...(drain === undefined ? {} : { drain }),
    ...(redact === undefined ? {} : { redact }),
  })

  return log
}

/**
 * The ambient logger, for packages and non-request code. Same instance the
 * app configured through `createLogger`.
 */
export { log } from "evlog"

/**
 * Open a request-scoped wide event for custom framework integrations
 * (e.g. TanStack Start request middleware). Accumulate context with
 * `set()` and call `emit()` when the response is ready — emitted events
 * ship through the global drain configured by `createLogger`.
 */
export { createRequestLogger } from "evlog"

export { createError, parseError } from "evlog"
export type { DrainContext, ParsedError, RequestLogger, WideEvent } from "evlog"
export type Logger = Log
