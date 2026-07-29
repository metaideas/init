import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import { tauri } from "@init/env/presets"
import { env, isCI } from "std-env"

export default createEnv({
  client: {},
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [tauri()],
  runtimeEnv: { ...env, ...import.meta.env },
  skipValidation: isCI,
})
