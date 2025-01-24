import { withSentry } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"

import { withEnv } from "~/lib/env"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withSentry(nextConfig)
nextConfig = withEnv(nextConfig)
nextConfig = withLogger(nextConfig)

export default nextConfig
