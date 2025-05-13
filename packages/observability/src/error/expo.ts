import envMobile from "@init/env/observability/expo"
import * as Sentry from "@sentry/react-native"

export function initializeErrorMonitoring() {
  Sentry.init({
    dsn: envMobile.EXPO_PUBLIC_SENTRY_DSN,

    tracesSampleRate: 0.1,

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  })
}

export { captureException, captureMessage, wrap } from "@sentry/react-native"
