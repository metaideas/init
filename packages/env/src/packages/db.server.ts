import { createEnv } from "@t3-oss/env-core"
import { getWorkerEnv, isNodeRuntime } from "@this/common/utils/runtime"
import { z } from "zod"

export default createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string(),
  },
  runtimeEnv: isNodeRuntime ? process.env : await getWorkerEnv(),
})
