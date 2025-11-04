import { sentry } from "@init/env/presets"
import { isProduction } from "@init/utils/environment"
import * as Sentry from "@sentry/react-native"

export function initializeErrorMonitoring() {
  const env = sentry.expo()
  const monitoringSampleRate = isProduction() ? 0.1 : 1

  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,

    // Adds more context data to events (IP address, cookies, user, etc.) For
    // more information, visit:
    // https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    tracesSampleRate: monitoringSampleRate,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: monitoringSampleRate,
    integrations: [Sentry.mobileReplayIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}

export const monitoringWrap = Sentry.wrap
export const captureException = Sentry.captureException
