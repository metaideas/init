import { withContentCollections } from "@content-collections/next"

import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withIntl } from "@init/internationalization/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

// Environment variables
import { ensureEnv } from "@init/env"
import observabilityEnv from "@init/env/observability/nextjs"

// Local environment variables
import appEnv from "~/shared/env"

ensureEnv([
  appEnv, // Environment variables for this app
  // Packages
  observabilityEnv,
])

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withAnalytics(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
