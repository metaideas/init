import { createEnv } from "@init/env/nextjs"
// Packages
import { vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

export default createEnv({
  experimental__runtimeEnv: {},
  server: {
    ANALYZE: z.stringbool().default(false),
  },
  extends: [vercel()],
})
