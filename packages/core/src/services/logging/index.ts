export type LogEvent = Record<string, unknown>

/**
 * The logger a package workspace accepts. Application workspaces pass their own logger, so packages
 * emit structured events without choosing where they go.
 */
export type Logger = {
  debug: (event: LogEvent) => void
  info: (event: LogEvent) => void
  warn: (event: LogEvent) => void
  error: (event: LogEvent) => void
}
