import { createEnv } from "@t3-oss/env-core"
import { getWorkerEnv, isNodeRuntime } from "@this/common/utils/runtime"
import { z } from "zod"

export default createEnv({
  server: {
    AXIOM_DATASET: z.string(),
    AXIOM_TOKEN: z.string(),
  },
  runtimeEnv: isNodeRuntime ? process.env : await getWorkerEnv(),
})
