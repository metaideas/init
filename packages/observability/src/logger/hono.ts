/**
 * Request-scoped wide-event logging for Hono. `requestLogger()` opens one event per request,
 * exposes it as `c.var.log` (merge `LoggerVariables` into the app context type), and emits it when
 * the response goes out. Events ship through the drain configured by `initLogger`.
 */
export { evlog as requestLogger, useLogger } from "evlog/hono"
export type { EvlogVariables as LoggerVariables } from "evlog/hono"
