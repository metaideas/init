import { init } from "@sentry/nextjs"
import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next/types"

import env from "@this/env/observability/nextjs"
import { isProduction } from "@this/utils/environment"

export * as Sentry from "@sentry/nextjs"
export { captureException, captureMessage } from "@sentry/nextjs"

export function registerErrorMonitoring() {
  init({
    dsn: env.SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: 1,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    spotlight: isProduction && process.env.NEXT_RUNTIME === "nodejs",
  })
}

export function withErrorMonitoring(config: NextConfig) {
  return withSentryConfig(config, {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    debug: env.SENTRY_DEBUG,

    // An auth token is required for uploading source maps
    authToken: env.SENTRY_AUTH_TOKEN,

    silent: !process.env.CI,

    widenClientFileUpload: true,

    tunnelRoute: "/monitoring",
  })
}
