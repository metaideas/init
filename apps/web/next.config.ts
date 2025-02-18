import { withContentCollections } from "@content-collections/next"
import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import { withAnalytics } from "@this/analytics/posthog/nextjs"
import { withErrorMonitoring } from "@this/observability/error/nextjs"
import { withLogging } from "@this/observability/logger/nextjs"

import dbServer from "@this/env/db.server"
import { ensureEnv } from "@this/env/helpers"
import kvServer from "@this/env/kv.server"
import queueServer from "@this/env/queue.server"

import appEnv from "~/shared/env"

ensureEnv([
  appEnv, // Environment variables for this app
  dbServer,
  queueServer,
  kvServer,
])

const withBundleAnalyzer = bundleAnalyzer({
  enabled: appEnv.ANALYZE,
})

const withIntl = createNextIntlPlugin("./src/shared/i18n/request.ts")

let nextConfig: NextConfig = {}

nextConfig = withAnalytics(nextConfig)
nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
