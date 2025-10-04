import { sentry } from "@init/env/presets"
import { assertUnreachable } from "@init/utils/assert"
import * as Sentry from "@sentry/astro"
import { MONITORING_SAMPLE_RATE } from "./config"

export { default as errorMonitoring } from "@sentry/astro"

export function initializeErrorMonitoring(type: "server" | "client") {
  if (type === "client") {
    const env = sentry.react()

    Sentry.init({
      dsn: env.PUBLIC_SENTRY_DSN,
      debug: env.PUBLIC_SENTRY_DEBUG,
      tracesSampleRate: MONITORING_SAMPLE_RATE,

      integrations: [
        Sentry.browserTracingIntegration(), // Added for performance monitoring
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    })
  } else if (type === "server") {
    const env = sentry.server()

    Sentry.init({
      dsn: env.SENTRY_DSN,
      debug: env.SENTRY_DEBUG,
      tracesSampleRate: MONITORING_SAMPLE_RATE,
    })
  } else {
    assertUnreachable(type)
  }
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
