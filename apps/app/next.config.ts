import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

import { withAnalytics } from "@this/analytics/posthog/nextjs"
import { withIntl } from "@this/i18n/nextjs/config"
import { withErrorMonitoring } from "@this/observability/error/nextjs"
import { withLogging } from "@this/observability/logger/nextjs"

import { ensureEnv } from "@this/env"
import dbEnv from "@this/env/db"
import kvEnv from "@this/env/kv"
import queueEnv from "@this/env/queue"

import appEnv from "~/shared/env"

ensureEnv([
  appEnv, // Environment variables for this app
  dbEnv,
  kvEnv,
  queueEnv,
])

const withBundleAnalyzer = bundleAnalyzer({
  enabled: appEnv.ANALYZE,
})

let nextConfig: NextConfig = {}

nextConfig = withAnalytics(nextConfig)
nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withIntl(nextConfig)

export default nextConfig
