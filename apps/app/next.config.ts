import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

import { withAnalytics } from "@init/analytics/product/nextjs"
import { withIntl } from "@init/internationalization/nextjs/config"
import { withErrorMonitoring } from "@init/observability/error/nextjs"
import { withLogging } from "@init/observability/logger/nextjs"

import { ensureEnv } from "@init/env"
import dbEnv from "@init/env/db"
import kvEnv from "@init/env/kv"
import queueEnv from "@init/env/queue"

import appEnv from "~/shared/env"

ensureEnv([
  appEnv, // Environment variables for this app
  dbEnv,
  kvEnv,
  queueEnv,
])

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withAnalytics(nextConfig)
nextConfig = withErrorMonitoring(nextConfig)
nextConfig = withLogging(nextConfig)
nextConfig = withIntl(nextConfig)

export default nextConfig
