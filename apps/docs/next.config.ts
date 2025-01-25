import bundleAnalyzer from "@next/bundle-analyzer"
import { rewrites as analyticsRewrites } from "@this/analytics/posthog/nextjs"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import env, { withEnv } from "~/lib/env"

const withMDX = createMDX()
const withBundleAnalyzer = bundleAnalyzer({
  enabled: env.ANALYZE,
})

let nextConfig: NextConfig = {
  rewrites: async () => [...analyticsRewrites],
}

nextConfig = withEnv(nextConfig)
nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
