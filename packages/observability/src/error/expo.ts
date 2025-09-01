import { sentry } from "@init/env/presets"
import * as Sentry from "@sentry/react-native"
import { MONITORING_SAMPLE_RATE } from "./config"

export function initializeErrorMonitoring() {
  const env = sentry.expo()

  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,

    // Adds more context data to events (IP address, cookies, user, etc.) For
    // more information, visit:
    // https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    tracesSampleRate: MONITORING_SAMPLE_RATE,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: MONITORING_SAMPLE_RATE,
    integrations: [Sentry.mobileReplayIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}

export const monitoringWrap = Sentry.wrap
export const captureException = Sentry.captureException
