import * as Sentry from "@sentry/react-native"

import env from "@init/env/observability/expo"
import {
  DEVELOPMENT_MONITORING_SAMPLE_RATE,
  PRODUCTION_MONITORING_SAMPLE_RATE,
} from "@init/utils/constants"
import { isDevelopment } from "@init/utils/environment"

export function initializeErrorMonitoring() {
  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,

    tracesSampleRate: isDevelopment
      ? DEVELOPMENT_MONITORING_SAMPLE_RATE
      : PRODUCTION_MONITORING_SAMPLE_RATE,

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}

export const monitoringWrap = Sentry.wrap
export const captureException = Sentry.captureException
