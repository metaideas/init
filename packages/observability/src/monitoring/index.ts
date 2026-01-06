import { node, sentry } from "@init/env/presets"
import { assertUnreachable } from "@init/utils/assert"
import { isProduction } from "@init/utils/environment"

export async function initializeErrorMonitoring(type: "server" | "client") {
  const monitoringSampleRate = isProduction() ? 0.1 : 1

  if (type === "client") {
    const Sentry = await import("@sentry/browser")
    const env = sentry.client()

    Sentry.init({
      debug: env.PUBLIC_SENTRY_DEBUG,
      dsn: env.PUBLIC_SENTRY_DSN,

      enableLogs: true,

      integrations: [
        Sentry.browserTracingIntegration(), // Added for performance monitoring
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          blockAllMedia: true,
          maskAllText: true,
        }),
        // Use console logging integration to send logs to Sentry
        // Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
      ],

      replaysOnErrorSampleRate: 1,

      replaysSessionSampleRate: monitoringSampleRate,

      sendDefaultPii: true,

      tracesSampleRate: monitoringSampleRate,
    })

    return
  }

  if (type === "server") {
    const Sentry = await import("@sentry/node")
    const env = sentry.server()
    const nodeEnv = node()

    Sentry.init({
      debug: env.SENTRY_DEBUG,
      dsn: env.SENTRY_DSN,

      enableLogs: true,

      environment: nodeEnv.NODE_ENV,

      integrations: [
        // Use console logging integration to send logs to Sentry
        // LogTape logs to console, so Sentry will capture console logs
        // Sentry.consoleLoggingIntegration({ levels: ["error", "warn"] }),
      ],

      tracesSampleRate: monitoringSampleRate,
    })

    return
  }

  assertUnreachable(type)
}

export {
  captureException,
  captureMessage,
  isInitialized,
  logger as monitoringLogger,
  withScope,
} from "@sentry/core"
