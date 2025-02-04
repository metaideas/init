import { withContentCollections } from "@content-collections/next"
import bundleAnalyzer from "@next/bundle-analyzer"
import { rewrites as analyticsRewrites } from "@this/analytics/posthog/nextjs"
import { ensureEnv } from "@this/env/helpers"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import dbServer from "@this/env/db.server"
import appEnv from "~/lib/env"

ensureEnv([
  appEnv, // Environment variables for this app
  dbServer,
])

const withBundleAnalyzer = bundleAnalyzer({
  enabled: appEnv.ANALYZE,
})

const withIntl = createNextIntlPlugin("./src/lib/i18n/request.ts")

let nextConfig: NextConfig = {
  rewrites: async () => [...analyticsRewrites],

  transpilePackages: [
    "@this/db",
    "@this/env",
    "@this/observability",
    "@this/ui",
    "@this/validation",
  ],
}

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
