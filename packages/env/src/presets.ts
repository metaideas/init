import * as z from "@init/utils/schema"
import { createEnv } from "@t3-oss/env-core"

export const node = () =>
  createEnv({
    server: {
      NODE_ENV: z.env(),
    },
    runtimeEnv: process.env,
  })

export * from "@t3-oss/env-core/presets-zod"
