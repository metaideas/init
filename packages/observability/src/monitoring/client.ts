import { isProduction } from "@init/utils/env"
import * as Sentry from "@sentry/browser"
import { ENV } from "#env.generated.ts"

export function initializeErrorMonitoring() {
  const monitoringSampleRate = isProduction ? 0.1 : 1
  Sentry.init({
    debug: ENV.PUBLIC_SENTRY_DEBUG,
    dsn: ENV.PUBLIC_SENTRY_DSN,
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
