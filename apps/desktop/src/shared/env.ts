import { createEnv } from "@init/env"
import { tauri } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "PUBLIC_",
  extends: [tauri()],
  runtimeEnv: import.meta.env,
  skipValidation: isCI,
})
