import { createUrlBuilder } from "@this/common/utils/url"
import { isProduction } from "@this/common/variables"
import env from "~/lib/env"

export const buildUrl = createUrlBuilder(
  env.NEXT_PUBLIC_DOMAIN,
  isProduction ? "https" : "http"
)
