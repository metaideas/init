import bundleAnalyzer from "@next/bundle-analyzer"
import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

// Environment variables
import { ensureEnv } from "@init/env"
import observabilityEnv from "@init/env/observability/nextjs"

import appEnv from "~/shared/env"

ensureEnv([
  appEnv,
  // Import environment variables for all the packages you are using
  observabilityEnv,
])

const withMDX = createMDX()
const withBundleAnalyzer = bundleAnalyzer({
  enabled: appEnv.ANALYZE,
})

let nextConfig: NextConfig = {}

nextConfig = withAnalytics(nextConfig)
nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
