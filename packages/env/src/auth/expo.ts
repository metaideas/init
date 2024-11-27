import { createEnv } from "@t3-oss/env-core"
import { getRuntimeEnv } from "@this/common/utils/runtime"
import { z } from "zod"

import envShared from "#shared.ts"

const runtimeEnv = await getRuntimeEnv()

export default createEnv({
  client: {
    EXPO_PUBLIC_BETTER_AUTH_URL: z.string().url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv,
  extends: [envShared],
})
