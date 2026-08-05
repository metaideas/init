import { isProduction, isTest } from "@init/utils/env"
import * as Sentry from "@sentry/node"
import { ENV } from "#env.generated.ts"

export function initializeErrorMonitoring() {
  const monitoringSampleRate = isProduction ? 0.1 : 1
  const environment = isProduction ? "production" : isTest ? "test" : "development"

  Sentry.init({
    debug: ENV.SENTRY_DEBUG,
    dsn: ENV.SENTRY_DSN,

    enableLogs: true,

    environment,

    integrations: [],

    tracesSampleRate: monitoringSampleRate,
  })
}
