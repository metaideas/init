import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import { withEnv } from "~/lib/env"

const withMDX = createMDX()

let nextConfig: NextConfig = {
  // Your config options here
}

nextConfig = withEnv(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
