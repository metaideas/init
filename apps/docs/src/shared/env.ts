import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_MARKETING_URL: z.url().optional(),
    PUBLIC_SITE_URL: z.url().optional(),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  runtimeEnv: { ...env, ...import.meta.env },
  server: {},
  skipValidation: isCI,
})
