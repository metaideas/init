import { createEnv } from "@init/env/nextjs"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
  },
  server: {
    TAURI_DEV_HOST: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    TAURI_DEV_HOST: process.env.TAURI_DEV_HOST,
  },
})
