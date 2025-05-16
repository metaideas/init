import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    AXIOM_DATASET: z.string(),
    AXIOM_TOKEN: z.string(),

    SENTRY_DSN: z.string(),
    SENTRY_ORGANIZATION: z.string(),
    SENTRY_PROJECT: z.string(),
    SENTRY_DEBUG: z.booleanLike().optional().default(false),
    SENTRY_AUTH_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_OBSERVABILITY_SERVER === "true",
})
