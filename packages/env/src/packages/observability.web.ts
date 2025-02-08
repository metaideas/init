import { createEnv } from "@t3-oss/env-nextjs"

import * as z from "@this/utils/schema"

export default createEnv({
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
    NEXT_PUBLIC_AXIOM_DATASET: z.string(),
    NEXT_PUBLIC_AXIOM_TOKEN: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
  },
  skipValidation: process.env.SKIP_VALIDATION_OBSERVABILITY_WEB === "true",
})
