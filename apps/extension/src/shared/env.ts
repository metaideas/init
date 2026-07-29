import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import { isCI } from "std-env"

export default createEnv({
  client: {},
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  extends: [],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
