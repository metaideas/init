import * as Sentry from "@sentry/react-native"

import envMobile from "@init/env/observability/expo"
import {
  DEVELOPMENT_MONITORING_SAMPLE_RATE,
  PRODUCTION_MONITORING_SAMPLE_RATE,
} from "@init/utils/constants"
import { isDevelopment } from "@init/utils/environment"

export function initializeErrorMonitoring() {
  Sentry.init({
    dsn: envMobile.EXPO_PUBLIC_SENTRY_DSN,

    debug: true,

    tracesSampleRate: isDevelopment
      ? DEVELOPMENT_MONITORING_SAMPLE_RATE
      : PRODUCTION_MONITORING_SAMPLE_RATE,

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}
