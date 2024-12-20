import { createEnv } from "@t3-oss/env-core"
import { createEnv as createNextjsEnv } from "@t3-oss/env-nextjs"
import type { NextConfig } from "next"

export function ensureEnv(
  packages: ReturnType<typeof createEnv>[],
  options: {
    env: Record<string, string>
    clientPrefix?: string
  }
) {
  createEnv({
    extends: packages,
    server: {},
    client: {},
    shared: {},
    runtimeEnv: options.env,
    clientPrefix: options.clientPrefix,
  })
}

/**
 * Ensures environment variables for your packages are available in Next.js
 * during build time. Exports a `withEnv` function that is used to check
 * environment variables in your Next.js config.
 */
export function ensureNextjsEnv(packages: ReturnType<typeof createEnv>[]) {
  return {
    withEnv: (config: NextConfig) => {
      createNextjsEnv({
        extends: packages,
        server: {},
        client: {},
        shared: {},
        runtimeEnv: process.env,
      })

      return config
    },
  }
}
