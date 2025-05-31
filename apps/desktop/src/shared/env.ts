import { createNextjsEnv } from "@init/env"
import * as z from "@init/utils/schema"

export default createNextjsEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  server: {
    TAURI_DEV_HOST: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    TAURI_DEV_HOST: process.env.TAURI_DEV_HOST,
  },
})
