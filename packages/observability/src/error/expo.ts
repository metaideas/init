import { sentryExpo } from "@init/env/presets"
import * as Sentry from "@sentry/react-native"

import { MONITORING_SAMPLE_RATE } from "./config"

export function initializeErrorMonitoring() {
  const env = sentryExpo()

  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,

    tracesSampleRate: MONITORING_SAMPLE_RATE,

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}

export const monitoringWrap = Sentry.wrap
export const captureException = Sentry.captureException
