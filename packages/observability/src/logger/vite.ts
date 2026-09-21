import type { LogLevel } from "evlog"
import { createSourceLocationPlugin, createStripPlugin } from "evlog/vite"

type BuildTransformOptions = {
  /**
   * Log levels removed from production builds.
   */
  strip?: LogLevel[]
}

/**
 * Build-time transforms for `log` calls: strips `log.debug` from production builds and injects
 * `file:line` source locations during development. Both match calls written literally as
 * `log.<level>(...)`.
 *
 * Runtime configuration stays with `initLogger` in each app's `#shared/logger.ts`; evlog's
 * auto-init plugin is deliberately left out.
 */
export function logTransforms(options: BuildTransformOptions = {}) {
  return [createStripPlugin(options.strip ?? ["debug"]), createSourceLocationPlugin()]
}
