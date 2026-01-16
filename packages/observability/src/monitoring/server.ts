import { node, sentry } from "@init/env/presets"
import { isProduction } from "@init/utils/environment"
import * as Sentry from "@sentry/node"

export function initializeErrorMonitoring() {
  const monitoringSampleRate = isProduction() ? 0.1 : 1
  const env = sentry.server()
  const nodeEnv = node()

  Sentry.init({
    debug: env.SENTRY_DEBUG,
    dsn: env.SENTRY_DSN,

    enableLogs: true,

    environment: nodeEnv.NODE_ENV,

    integrations: [],

    tracesSampleRate: monitoringSampleRate,
  })
}
