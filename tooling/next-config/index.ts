import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

export function createConfig(config: NextConfig = {}): NextConfig {
  return {
    ...config,

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
  }
}

export const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
