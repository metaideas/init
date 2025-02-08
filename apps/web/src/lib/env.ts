import { createNextjsEnv } from "@this/env/helpers"
import * as z from "@this/validation"

export default createNextjsEnv({
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
  server: {
    ANALYZE: z.booleanLike().default(false),
  },
  shared: {
    NEXT_PUBLIC_DOMAIN: z.string(),
  },
})
