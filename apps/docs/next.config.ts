import { createMDX } from "fumadocs-mdx/next"

import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

// Environment variables
import { ensureEnv } from "@init/env"
import observabilityEnv from "@init/env/observability/nextjs"

import appEnv from "~/shared/env"

const withMDX = createMDX()

ensureEnv([
  appEnv,
  // Import environment variables for all the packages you are using
  observabilityEnv,
])

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withAnalytics(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
