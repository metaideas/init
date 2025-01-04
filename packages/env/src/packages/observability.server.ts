import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    AXIOM_DATASET: z.string(),
    AXIOM_TOKEN: z.string(),

    SENTRY_DSN: z.string(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),
    SENTRY_DEBUG: z.boolean(),
    SENTRY_AUTH_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_OBSERVABILITY_SERVER === "true",
})
