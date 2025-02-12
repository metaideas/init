import { createEnv } from "@this/env/helpers"
import * as z from "@this/utils/schema"

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
