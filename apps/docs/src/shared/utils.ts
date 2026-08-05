import { isDevelopment } from "@init/utils/env"

import { DEVELOPMENT_MARKETING_URL, MARKETING_URL } from "#shared/constants.ts"
import { ENV } from "#shared/env.generated.ts"

export const marketingUrl =
  ENV.PUBLIC_MARKETING_URL ?? (isDevelopment ? DEVELOPMENT_MARKETING_URL : MARKETING_URL)
