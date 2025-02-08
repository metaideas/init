import * as Sentry from "@sentry/react-native"

import envMobile from "@this/env/observability.mobile"

export function initializeSentry() {
  Sentry.init({
    dsn: envMobile.EXPO_PUBLIC_SENTRY_DSN,

    tracesSampleRate: 0.1,
  })
}
