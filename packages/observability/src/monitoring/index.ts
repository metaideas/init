import { node, sentry } from "@init/env/presets"
import { assertUnreachable } from "@init/utils/assert"
import { isProduction } from "@init/utils/environment"

export async function initializeErrorMonitoring(type: "server" | "client") {
  const monitoringSampleRate = isProduction() ? 0.1 : 1

  if (type === "client") {
    const Sentry = await import("@sentry/browser")
    const env = sentry.client()

    Sentry.init({
      dsn: env.PUBLIC_SENTRY_DSN,
      debug: env.PUBLIC_SENTRY_DEBUG,
      tracesSampleRate: monitoringSampleRate,

      replaysOnErrorSampleRate: 1,

      replaysSessionSampleRate: monitoringSampleRate,

      sendDefaultPii: true,

      enableLogs: true,

      integrations: [
        Sentry.browserTracingIntegration(), // Added for performance monitoring
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        }),
        // Use console logging integration to send logs to Sentry
        // Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
      ],
    })

    return
  }

  if (type === "server") {
    const Sentry = await import("@sentry/node")
    const env = sentry.server()
    const nodeEnv = node()

    Sentry.init({
      dsn: env.SENTRY_DSN,
      debug: env.SENTRY_DEBUG,
      tracesSampleRate: monitoringSampleRate,

      environment: nodeEnv.NODE_ENV,

      enableLogs: true,

      integrations: [
        // Use Pino integration to send logs to Sentry
        Sentry.pinoIntegration({
          error: { levels: ["error", "warn"] },
          autoInstrument: false,
        }),
      ],
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
