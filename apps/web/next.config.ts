import { withContentCollections } from "@content-collections/next"

import { withIntl } from "@init/internationalization/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

// Verify environment variables
import "~/shared/env"

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
