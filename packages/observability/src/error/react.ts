import { sentry } from "@init/env/presets"
import * as Sentry from "@sentry/react"
import { useEffect } from "react"
import { MONITORING_SAMPLE_RATE } from "./config"

export function initializeErrorMonitoring() {
  const env = sentry.react()

  Sentry.init({
    dsn: env.PUBLIC_SENTRY_DSN,
    tracesSampleRate: MONITORING_SAMPLE_RATE,

    replaysOnErrorSampleRate: 1,

    replaysSessionSampleRate: MONITORING_SAMPLE_RATE,

    sendDefaultPii: true,

    integrations: [
      Sentry.browserTracingIntegration(), // Added for performance monitoring
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}

export function useReportError(error: Error, pathname?: string) {
  useEffect(() => {
    captureException(error, {
      data: {
        pathname,
      },
    })
  }, [error, pathname])
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
