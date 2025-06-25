import { withIntl } from "@init/internationalization/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import "~/shared/env"

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withIntl(nextConfig)

export default nextConfig
