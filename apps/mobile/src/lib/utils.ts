import { createUrlBuilder } from "@this/common/utils/url"
import { isProduction } from "@this/common/variables"

import env from "~/lib/env"

export const buildApiUrl = createUrlBuilder(
  env.EXPO_PUBLIC_SERVER_URL,
  isProduction ? "https" : "http"
)
