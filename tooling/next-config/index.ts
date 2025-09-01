import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

export function createConfig(config: NextConfig = {}): NextConfig {
  return {
    ...config,
    typedRoutes: true,
    serverExternalPackages: ["pino", "@axiomhq/pino"],
    transpilePackages: [
      "@init/ai",
      "@init/analytics",
      "@init/auth",
      "@init/db",
      "@init/email",
      "@init/env",
      "@init/internationalization",
      "@init/kv",
      "@init/observability",
      "@init/queue",
      "@init/security",
      "@init/ui",
      "@init/utils",
    ],
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
}

export const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
