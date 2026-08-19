import type { EvlogViteOptions } from "evlog/vite"
import evlogVite from "evlog/vite"

/**
 * Vite plugin for evlog: auto-initializes the logger, strips `log.debug` calls from production
 * builds, and can inject `file:line` source locations.
 *
 * Auto-initialization defers to an explicit `createLogger` call, so keeping the per-app logger
 * singleton alongside this plugin is safe.
 */
export function observability(options: EvlogViteOptions & { service: string }) {
  return evlogVite(options)
}
