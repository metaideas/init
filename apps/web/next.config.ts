import { withContentCollections } from "@content-collections/next"

import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withIntl } from "@init/internationalization/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

// Verify environment variables
import "~/shared/env"

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withAnalytics(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
