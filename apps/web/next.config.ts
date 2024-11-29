import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withLogger(nextConfig)

export default nextConfig
