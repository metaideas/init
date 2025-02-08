import { isProduction } from "@this/utils/environment"
import { createUrlBuilder } from "@this/utils/url"

import env from "~/lib/env"

export const buildUrl = createUrlBuilder(
  env.NEXT_PUBLIC_VERCEL_URL,
  isProduction ? "https" : "http"
)

// If you are using a separate API, you can use this function to build the API URLs.
export const buildApiUrl = createUrlBuilder(
  env.NEXT_PUBLIC_API_URL ?? `${env.NEXT_PUBLIC_VERCEL_URL}/api`,
  isProduction ? "https" : "http"
)

console.log({ API_URL: env.NEXT_PUBLIC_API_URL, buildApiUrl: buildApiUrl("/") })
