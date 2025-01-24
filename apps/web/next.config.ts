import { withContentCollections } from "@content-collections/next"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"

import { withEnv } from "~/lib/env"

let nextConfig: NextConfig = {
  // Your config options here
}

nextConfig = withEnv(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
