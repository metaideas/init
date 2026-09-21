/**
 * The logger, shared by every app and package. It is process-wide: apps configure it once at
 * startup with `initLogger` (from their `#shared/logger.ts`) and everything else just imports it.
 */
export { log } from "evlog"

/**
 * Configure the logger for an app. Call once at startup; the configuration is process-wide and
 * last-call-wins. Server apps pass `buildDrain()` from `#logger/drains.ts` as `drain`.
 */
export { initLogger } from "evlog"

/**
 * Open a request-scoped wide event where evlog has no framework integration (e.g. TanStack Start
 * request middleware). Accumulate context with `set()` and call `emit()` when the response is ready
 * — emitted events ship through the drain configured by `initLogger`.
 */
export { createRequestLogger } from "evlog"

export { createError, parseError } from "evlog"
export type { DrainContext, Log, LoggerConfig, ParsedError, RequestLogger, WideEvent } from "evlog"
