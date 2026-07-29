import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import { auth, db, resend, sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_BASE_URL: z.url({ protocol: /^https?$/ }),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [
    auth(),
    auth.providers.github(),
    auth.providers.google(),
    db(),
    resend(),
    sentry.client(),
  ],
  runtimeEnv: { ...env, ...import.meta.env },
  server: {},
  skipValidation: isCI,
})
