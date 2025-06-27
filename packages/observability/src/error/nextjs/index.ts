import { sentryNextjs } from "@init/env/presets"
import * as Sentry from "@sentry/nextjs"
import type { NextConfig } from "next/types"
import { MONITORING_SAMPLE_RATE } from "../config"

export function registerErrorMonitoring() {
  const env = sentryNextjs()

  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    debug: env.SENTRY_DEBUG,
    tracesSampleRate: MONITORING_SAMPLE_RATE,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    spotlight: process.env.NEXT_RUNTIME === "nodejs",
  })
}

export function withErrorMonitoring(config: NextConfig) {
  const env = sentryNextjs()

  return Sentry.withSentryConfig(config, {
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

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
export const captureRequestError = Sentry.captureRequestError
