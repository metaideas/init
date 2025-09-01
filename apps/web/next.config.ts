import { createContentCollectionPlugin } from "@content-collections/next"
import { withIntl } from "@init/internationalization/nextjs/config"
import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

// Verify environment variables
import "~/shared/env"

const withContentCollections = createContentCollectionPlugin({
  configPath: "src/content-collections.ts",
})

let nextConfig = createConfig()

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withIntl(nextConfig)
nextConfig = withContentCollections(nextConfig)

export default nextConfig
