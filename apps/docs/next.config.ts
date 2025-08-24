import { createConfig, withBundleAnalyzer } from "@tooling/next-config"
import { createMDX } from "fumadocs-mdx/next"

// Verify environment variables
import "~/shared/env"

const withMDX = createMDX({
  configPath: "source.config.ts",
})

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withMDX(nextConfig)

export default nextConfig
