import { withLogger } from "@this/observability/logger/nextjs"
import { withSentry } from "@this/observability/sentry/nextjs"
import type { NextConfig } from "next"
import { withEnv } from "~/config/env"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withSentry(nextConfig)
nextConfig = withEnv(nextConfig)
nextConfig = withLogger(nextConfig)

export default nextConfig
