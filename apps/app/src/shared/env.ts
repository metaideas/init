import { createEnv } from "@init/env"
import { auth, db, node } from "@init/env/presets"
import { REACT_PUBLIC_ENV_PREFIX } from "@init/utils/constants"
import { isCI, isProduction } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url().optional(),
    PUBLIC_BASE_URL: z.url()
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [node(), auth(), auth.providers.github(), auth.providers.google(), db()],
  // Load server environment variables (process.env) and client environment
  // variables (import.meta.env)
  runtimeEnv: { ...import.meta.env, ...process.env },
  server: {},
  skipValidation: isCI(),
})
