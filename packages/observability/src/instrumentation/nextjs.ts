import * as Sentry from "@sentry/nextjs"
import { withSentryConfig } from "@sentry/nextjs"
import { isProduction } from "@this/common/variables"
import envServer from "@this/env/observability.server"
import envWeb from "@this/env/observability.web"
import type { NextConfig } from "next"

const options = {
  dsn: envWeb.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
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
  if (runtime === "server") {
    Sentry.init({
      ...options,
      debug: envServer.SENTRY_DEBUG,

      // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
      spotlight: isProduction,
    })

    return
  }

  if (runtime === "edge") {
    Sentry.init({
      ...options,
      debug: envServer.SENTRY_DEBUG,
    })

    return
  }

  if (runtime === "client" && typeof window !== "undefined") {
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

    return
  }
}

export function withInstrumentation(config: NextConfig) {
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
