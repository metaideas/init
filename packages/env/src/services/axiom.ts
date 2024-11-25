import { createEnv } from "@t3-oss/env-core"
import { getRuntimeEnv } from "@this/common/utils/runtime"
import { z } from "zod"

import shared from "#shared.ts"

const runtimeEnv = await getRuntimeEnv()

export default createEnv({
  server: {
    AXIOM_DATASET: z.string(),
    AXIOM_TOKEN: z.string(),
  },
  extends: [shared],
  runtimeEnv,

  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
