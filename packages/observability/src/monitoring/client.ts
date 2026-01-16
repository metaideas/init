import { sentry } from "@init/env/presets"
import { isProduction } from "@init/utils/environment"
import * as Sentry from "@sentry/browser"

export function initializeErrorMonitoring() {
  const monitoringSampleRate = isProduction() ? 0.1 : 1
  const env = sentry.client()

  Sentry.init({
    debug: env.PUBLIC_SENTRY_DEBUG,
    dsn: env.PUBLIC_SENTRY_DSN,

    enableLogs: true,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        blockAllMedia: true,
        maskAllText: true,
      }),
    ],

    replaysOnErrorSampleRate: 1,

    replaysSessionSampleRate: monitoringSampleRate,

    sendDefaultPii: true,

    tracesSampleRate: monitoringSampleRate,
  })
}
