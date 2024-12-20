import { withLogger } from "@this/observability/logger/nextjs"
import { withSentryConfig } from "@this/observability/sentry/nextjs"
import type { NextConfig } from "next"
import { withEnv } from "~/config/env"

import observabilityServer from "@this/env/observability.server"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withSentryConfig(nextConfig, {
  org: observabilityServer.SENTRY_ORG,
  project: observabilityServer.SENTRY_PROJECT,
  debug: observabilityServer.SENTRY_DEBUG,

  // An auth token is required for uploading source maps
  authToken: observabilityServer.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,

  widenClientFileUpload: true,

  tunnelRoute: "/monitoring",
})

nextConfig = withEnv(nextConfig)
nextConfig = withLogger(nextConfig)

export default nextConfig
