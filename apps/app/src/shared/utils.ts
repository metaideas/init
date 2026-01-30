import { createUrlBuilder } from "@init/utils/url"
import env from "#shared/env.ts"

const isProduction = import.meta.env.PROD

export const buildUrl = createUrlBuilder(env.PUBLIC_BASE_URL, isProduction ? "https" : "http")

export const baseUrl = buildUrl("/")

// If you are using a separate API, you can use this function to build the API URLs.
export const buildApiUrl = createUrlBuilder(
  env.PUBLIC_API_URL ?? `${env.PUBLIC_BASE_URL}/api`,
  isProduction ? "https" : "http"
)
