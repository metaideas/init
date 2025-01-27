import { createNextjsEnv } from "@this/env/helpers"
import * as z from "@this/validation"

export default createNextjsEnv({
  shared: {
    NEXT_PUBLIC_DOMAIN: z.string(),
  },
  server: {
    ANALYZE: z.booleanLike().default(false),
  },
  runtimeEnv: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    ANALYZE: process.env.ANALYZE,
  },
})
