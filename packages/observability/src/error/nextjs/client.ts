import * as Sentry from "@sentry/nextjs"

import env from "@init/env/observability/nextjs"
import {
  DEVELOPMENT_MONITORING_SAMPLE_RATE,
  PRODUCTION_MONITORING_SAMPLE_RATE,
} from "@init/utils/constants"
import { isDevelopment } from "@init/utils/environment"

export function initializeErrorMonitoring() {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: isDevelopment
      ? DEVELOPMENT_MONITORING_SAMPLE_RATE
      : PRODUCTION_MONITORING_SAMPLE_RATE,

    replaysOnErrorSampleRate: 1,

    replaysSessionSampleRate: isDevelopment
      ? DEVELOPMENT_MONITORING_SAMPLE_RATE
      : PRODUCTION_MONITORING_SAMPLE_RATE,

    sendDefaultPii: true,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
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

export const captureRouterTransitionStart = Sentry.captureRouterTransitionStart
