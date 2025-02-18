import { createEnv } from "@t3-oss/env-core"

/**
 * Ensures environment variables for your packages are available in your
 * application.
 */
export function ensureEnv<T extends Record<string, unknown>[]>(
  packages: T,
  options?: {
    env?: Record<string, string | undefined>
    clientPrefix?: string
  }
) {
  return createEnv({
    extends: packages,
    server: {},
    client: {},
    shared: {},
    runtimeEnv: options?.env ?? process.env,
    clientPrefix: options?.clientPrefix ?? "NEXT_PUBLIC_",
  })
}

export { createEnv } from "@t3-oss/env-core"
export { createEnv as createNextjsEnv } from "@t3-oss/env-nextjs"
