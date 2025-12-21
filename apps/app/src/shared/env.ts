import { createEnv } from "@init/env"
import { auth, db, node } from "@init/env/presets"
import { REACT_PUBLIC_ENV_PREFIX } from "@init/utils/constants"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"
import { addProtocol } from "@init/utils/url"

export default createEnv({
  client: {
    PUBLIC_BASE_URL: z.string().pipe(z.preprocess((url) => addProtocol(url), z.url())),
    PUBLIC_API_URL: z.url().optional(),
  },
  server: {},
  extends: [node(), auth(), auth.providers.github(), auth.providers.google(), db()],
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  // Load server environment variables (process.env) and client environment
  // variables (import.meta.env)
  runtimeEnv: { ...import.meta.env, ...process.env },
  skipValidation: isCI(),
})
