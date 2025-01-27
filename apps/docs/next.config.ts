import bundleAnalyzer from "@next/bundle-analyzer"
import { rewrites as analyticsRewrites } from "@this/analytics/posthog/nextjs"
import { ensureEnv } from "@this/env/helpers"
import observabilityServer from "@this/env/observability.server"
import observabilityWeb from "@this/env/observability.web"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import appEnv from "~/lib/env"

ensureEnv([
  appEnv,
  // Import environment variables for all the packages you are using
  observabilityWeb,
  observabilityServer,
])

const withMDX = createMDX()
const withBundleAnalyzer = bundleAnalyzer({
  enabled: appEnv.ANALYZE,
})

let nextConfig: NextConfig = {
  rewrites: async () => [...analyticsRewrites],
}

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
