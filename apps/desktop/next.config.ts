import { createConfig, withBundleAnalyzer } from "@tooling/next-config"

let nextConfig = createConfig({
  output: "export",

  images: {
    unoptimized: true,
  },
})

nextConfig = withBundleAnalyzer(nextConfig)

export default nextConfig
