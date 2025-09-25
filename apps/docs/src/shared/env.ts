import { createEnv } from "@init/env/nextjs"
import { node, vercel } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  experimental__runtimeEnv: {},
  server: {
    ANALYZE: z.stringbool().default(false),
  },
  extends: [node(), vercel()],
  skipValidation: isCI(),
})
