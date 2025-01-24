import { withSentry } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"

import { withEnv } from "~/lib/env"

let nextConfig: NextConfig = {
  // Your config options here
}

nextConfig = withEnv(nextConfig)
nextConfig = withSentry(nextConfig)
nextConfig = withLogger(nextConfig)

export default nextConfig
