import { node, sentry } from "@init/env/presets"
import * as Sentry from "@sentry/node"
import { MONITORING_SAMPLE_RATE } from "./config"

export function registerErrorMonitoring() {
  const env = sentry.server()
  const nodeEnv = node()

  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: MONITORING_SAMPLE_RATE,

    environment: nodeEnv.NODE_ENV,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: env.SENTRY_SPOTLIGHT === "true",
  })
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
