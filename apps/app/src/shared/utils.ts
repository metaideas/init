import { isProduction } from "@init/utils/environment"
import { createUrlBuilder } from "@init/utils/url"
import env from "~/shared/env"

export const buildUrl = createUrlBuilder(
  env.NEXT_PUBLIC_BASE_URL,
  isProduction ? "https" : "http"
)

// If you are using a separate API, you can use this function to build the API URLs.
export const buildApiUrl = createUrlBuilder(
  env.NEXT_PUBLIC_API_URL ?? `${env.NEXT_PUBLIC_BASE_URL}/api`,
  isProduction ? "https" : "http"
)
