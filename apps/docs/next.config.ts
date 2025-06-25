import { createMDX } from "fumadocs-mdx/next"

import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

// Verify environment variables
import "~/shared/env"

const withMDX = createMDX()

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
