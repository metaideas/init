import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import { sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url({ protocol: /^https?$/ }).optional(),
    PUBLIC_BASE_URL: z.url({ protocol: /^https?$/ }),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [sentry.client()],
  runtimeEnv: { ...env, ...import.meta.env },
  server: {},
  skipValidation: isCI,
})
