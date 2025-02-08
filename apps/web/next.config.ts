import { withContentCollections } from "@content-collections/next"
import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import rewrites from "@this/analytics/posthog/rewrites"
import dbServer from "@this/env/db.server"
import { ensureEnv } from "@this/env/helpers"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"

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
  rewrites: async () => [...rewrites],

  transpilePackages: [
    "@this/db",
    "@this/env",
    "@this/observability",
    "@this/ui",
    "@this/utils",
  ],
}

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
