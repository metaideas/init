import { isProduction } from "@init/utils/environment"
import { createUrlBuilder } from "@init/utils/url"
import env from "#shared/env.ts"

export const buildApiUrl = createUrlBuilder(
  env.PUBLIC_API_URL,
  isProduction() ? "https" : "http"
)
