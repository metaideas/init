import { withContentCollections } from "@content-collections/next"
import { withInstrumentation } from "@this/observability/instrumentation/nextjs"
import { withLogger } from "@this/observability/logger/nextjs"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withEnv } from "~/lib/env"

const withIntl = createNextIntlPlugin("./src/lib/i18n/request.ts")

let nextConfig: NextConfig = {
  // Your config options here
}

nextConfig = withEnv(nextConfig)
nextConfig = withInstrumentation(nextConfig)
nextConfig = withLogger(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
