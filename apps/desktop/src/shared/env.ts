import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import { tauri } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [tauri()],
  runtimeEnv: { ...env, ...import.meta.env },
  skipValidation: isCI,
})
