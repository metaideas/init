import { createEnv } from "@t3-oss/env-core"
import { createEnv as createNextjsEnv } from "@t3-oss/env-nextjs"
import type { NextConfig } from "next"

export function ensureEnv(
  local: ReturnType<typeof createEnv>,
  packages: ReturnType<typeof createEnv>[],
  options: {
    env: Record<string, string | undefined>
    clientPrefix?: string
  }
) {
  return {
    withEnv: () => {
      createEnv({
        extends: [local, ...packages],
        server: {},
        client: {},
        shared: {},
        runtimeEnv: options.env,
        clientPrefix: options.clientPrefix,
      })
    },
  }
}

/**
 * Ensures environment variables for your packages are available in Next.js
 * during build time. Exports a `withEnv` function that is used to check
 * environment variables in your Next.js config.
 */
export function ensureNextjsEnv(
  local: ReturnType<typeof createNextjsEnv>,
  packages: ReturnType<typeof createEnv>[]
) {
  return {
    withEnv: (config: NextConfig) => {
      createNextjsEnv({
        extends: [local, ...packages],
        server: {},
        client: {},
        shared: {},
        runtimeEnv: process.env,
      })

      return config
    },
  }
}

export { createEnv } from "@t3-oss/env-core"
export { createEnv as createNextjsEnv } from "@t3-oss/env-nextjs"
