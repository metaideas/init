import { createEnv } from "@t3-oss/env-core"
import * as z from "@this/validation"

export default createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
  },
  runtimeEnv: process.env,
})
