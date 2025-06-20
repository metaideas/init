import { createMDX } from "fumadocs-mdx/next"

import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

// Verify environment variables
import "~/shared/env"

const withMDX = createMDX()

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withAnalytics(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
