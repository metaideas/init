import { createEnv } from "@init/env"
import { tauri } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  runtimeEnv: import.meta.env,
  clientPrefix: "PUBLIC_",
  extends: [tauri()],
  skipValidation: isCI(),
})
