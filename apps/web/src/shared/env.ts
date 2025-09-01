import { createEnv } from "@init/env/nextjs"
import { vercel } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  server: {
    ANALYZE: z.stringbool().default(false),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().optional(),
  },
  extends: [vercel()],
  skipValidation: isCI,
})
