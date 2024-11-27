import { withLogger } from "@this/observability/logger/server"
import type { NextConfig } from "next"

let nextConfig: NextConfig = {
  /* config options here */
}

nextConfig = withLogger(nextConfig)

export default nextConfig
