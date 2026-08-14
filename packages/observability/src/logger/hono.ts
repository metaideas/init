import type { EvlogHonoOptions } from "evlog/hono"
import { evlog } from "evlog/hono"

/**
 * Request-scoped wide-event logging for Hono. Opens one event per request,
 * exposes it as `c.var.log` (merge `LoggerVariables` into the app context
 * type), and emits it when the response goes out.
 *
 * Without an explicit `drain`, events fall back to the global drain
 * configured through `createLogger`.
 */
export function withRequestLogging(options?: EvlogHonoOptions) {
  return evlog(options)
}

export { useLogger } from "evlog/hono"
export type { EvlogVariables as LoggerVariables } from "evlog/hono"
