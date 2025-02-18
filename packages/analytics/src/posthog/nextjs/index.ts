import type { NextConfig } from "next"
import type { Rewrite } from "next/dist/lib/load-custom-routes"

export function withAnalytics(config: NextConfig): NextConfig {
  return {
    ...config,
    rewrites: async () => {
      const rewrites = await config.rewrites?.()

      const analyticsRewrites: Rewrite[] = [
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://us.i.posthog.com/decide",
        },
      ]

      if (!rewrites) {
        return analyticsRewrites
      }

      if (Array.isArray(rewrites)) {
        return rewrites.concat(analyticsRewrites)
      }

      rewrites.afterFiles = (rewrites.afterFiles || []).concat(
        analyticsRewrites
      )

      return rewrites
    },
  }
}
