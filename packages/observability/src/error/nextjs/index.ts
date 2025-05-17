import * as Sentry from "@sentry/nextjs"
import type { NextConfig } from "next/types"

import env from "@init/env/observability/nextjs"
import { isProduction } from "@init/utils/environment"

export function registerErrorMonitoring() {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: isProduction ? 0.1 : 1,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    spotlight: isProduction && process.env.NEXT_RUNTIME === "nodejs",
  })
}

export function withErrorMonitoring(config: NextConfig) {
  return Sentry.withSentryConfig(config, {
    org: env.SENTRY_ORGANIZATION,
    project: env.SENTRY_PROJECT,
    debug: env.SENTRY_DEBUG,

    // An auth token is required for uploading source maps
    authToken: env.SENTRY_AUTH_TOKEN,

    silent: !process.env.CI,

    widenClientFileUpload: true,

    tunnelRoute: "/monitoring",
  })
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
