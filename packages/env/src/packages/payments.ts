import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_PAYMENTS_SERVER === "true",
})
