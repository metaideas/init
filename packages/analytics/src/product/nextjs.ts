import type { NextConfig } from "next"
import type { Rewrite } from "next/dist/lib/load-custom-routes"
import { usePathname, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { useEffect, useRef } from "react"

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

export function useTrackPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!posthog || !pathname) {
      return
    }

    const url = new URL(pathname, window.location.origin)
    url.search = searchParams.toString()
    const currentPath = url.toString()

    if (currentPath === prevPathRef.current) {
      return
    }

    posthog.capture("$pageview", {
      $current_url: currentPath,
    })

    prevPathRef.current = currentPath
  }, [pathname, searchParams, posthog])
}
