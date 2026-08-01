import { isDevelopment } from "std-env"

import { DEVELOPMENT_MARKETING_URL, MARKETING_URL } from "#shared/constants.ts"
import env from "#shared/env.ts"

export const marketingUrl =
  env.PUBLIC_MARKETING_URL ?? (isDevelopment ? DEVELOPMENT_MARKETING_URL : MARKETING_URL)
