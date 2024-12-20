import { createEnv } from "@t3-oss/env-core"
import { getWorkerEnv, isNodeRuntime } from "@this/common/utils/runtime"
import { z } from "zod"

export default createEnv({
  server: {
    QSTASH_URL: z.string().url(),
    QSTASH_TOKEN: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),
  },
  runtimeEnv: isNodeRuntime ? process.env : await getWorkerEnv(),
})
