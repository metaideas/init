import { withContentCollections } from "@content-collections/next"
import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

import { withAnalytics } from "@init/analytics/posthog/nextjs"
import { withIntl } from "@init/i18n/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

import { ensureEnv } from "@init/env"
import dbEnv from "@init/env/db"
import kvEnv from "@init/env/kv"
import queueEnv from "@init/env/queue"

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
nextConfig = withContentCollections(nextConfig)

export default nextConfig
