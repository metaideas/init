import { sentry } from "@init/env/presets"
import * as Sentry from "@sentry/node"
import { MONITORING_SAMPLE_RATE } from "./config"

export function registerErrorMonitoring() {
  const env = sentry.server()

  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: MONITORING_SAMPLE_RATE,
  })
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
