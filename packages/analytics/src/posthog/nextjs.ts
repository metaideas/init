import type { Rewrite } from "next/dist/lib/load-custom-routes"

export const rewrites: Rewrite[] = [
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
