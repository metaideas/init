import { sentry } from "@init/env/presets"
import * as Sentry from "@sentry/node"
import { isProduction, isTest } from "std-env"

export function initializeErrorMonitoring() {
  const monitoringSampleRate = isProduction ? 0.1 : 1
  const env = sentry.server()
  const environment = isProduction ? "production" : isTest ? "test" : "development"

  Sentry.init({
    debug: env.SENTRY_DEBUG,
    dsn: env.SENTRY_DSN,

    enableLogs: true,

    environment,

    integrations: [],

    tracesSampleRate: monitoringSampleRate,
  })
}
