import * as Sentry from "@sentry/node"

import env from "@init/env/observability/server"
import {
  DEVELOPMENT_MONITORING_SAMPLE_RATE,
  PRODUCTION_MONITORING_SAMPLE_RATE,
} from "@init/utils/constants"
import { isDevelopment } from "@init/utils/environment"

export function registerErrorMonitoring() {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: isDevelopment
      ? DEVELOPMENT_MONITORING_SAMPLE_RATE
      : PRODUCTION_MONITORING_SAMPLE_RATE,
  })
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
