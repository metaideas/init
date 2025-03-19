import { createEnv } from "@init/env"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    VITE_API_URL: z.string().url(),
  },
  server: {
    TAURI_DEV_HOST: z.string().optional(),
  },
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
})
