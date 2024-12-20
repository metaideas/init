import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"
import { withEnv } from "~/config/env"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withEnv(nextConfig)
nextConfig = withLogger(nextConfig)

export default nextConfig
