import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import "~/shared/env"

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)

export default nextConfig
