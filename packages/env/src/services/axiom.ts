import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import { getRuntimeEnv } from "#utils.ts"

const runtimeEnv = await getRuntimeEnv()

export default createEnv({
  server: {
    AXIOM_DATASET: z.string(),
    AXIOM_TOKEN: z.string(),
  },
  runtimeEnv,

  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
