import { createUrlBuilder } from "@this/common/utils/url"
import env from "~/lib/env"

export const buildUrl = createUrlBuilder(
  env.NEXT_PUBLIC_DOMAIN,
  // TODO(adelrodriguez): Replace this with env.IS_DEVELOPMENT
  process.env.NODE_ENV === "development" ? "http" : "https"
)
