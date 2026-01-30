import { createEnv } from "@init/env"
import { auth, db } from "@init/env/presets"
import { REACT_PUBLIC_ENV_PREFIX } from "@init/utils/constants"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url().optional(),
    PUBLIC_BASE_URL: z.url(),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [auth(), auth.providers.github(), auth.providers.google(), db()],
  // Load server environment variables (process.env) and client environment
  // variables (import.meta.env)
  runtimeEnv: { ...import.meta.env, ...process.env },
  server: {},
  skipValidation: isCI,
})
