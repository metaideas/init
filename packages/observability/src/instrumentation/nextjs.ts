import * as Sentry from "@sentry/nextjs"
import { withSentryConfig } from "@sentry/nextjs"
import envCore from "@this/env/core"
import envServer from "@this/env/observability.server"
import envWeb from "@this/env/observability.web"
import type { NextConfig } from "next"

const options = {
  dsn: envWeb.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: envServer.SENTRY_DEBUG,
}

export function registerSentry() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    initializeSentry("server")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    initializeSentry("edge")
  }
}

export function initializeSentry(runtime: "client" | "server" | "edge") {
  if (runtime === "client") {
    Sentry.init({
      ...options,
      replaysOnErrorSampleRate: 1.0,

      // This sets the sample rate to be 10%. You may want this to be 100% while
      // in development and sample at a lower rate in production
      replaysSessionSampleRate: 0.1,

      // You can remove this option if you're not planning to use the Sentry Session Replay feature:
      integrations: [
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    })
  }

  if (runtime === "server") {
    Sentry.init({
      ...options,

      // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
      spotlight: envCore.IS_DEVELOPMENT,
    })
  }

  if (runtime === "edge") {
    Sentry.init({
      ...options,
    })
  }
}

export function withSentry(config: NextConfig) {
  return withSentryConfig(config, {
    org: envServer.SENTRY_ORG,
    project: envServer.SENTRY_PROJECT,
    debug: envServer.SENTRY_DEBUG,

    // An auth token is required for uploading source maps
    authToken: envServer.SENTRY_AUTH_TOKEN,

    silent: !process.env.CI,

    widenClientFileUpload: true,

    tunnelRoute: "/monitoring",
  })
}
