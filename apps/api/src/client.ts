import { hc } from "hono/client"
import type { router } from "#routes/index.ts"

export function createClient(...args: Parameters<typeof hc>): ReturnType<typeof hc<typeof router>> {
  return hc<typeof router>(...args)
}

/**
 * This is the type of the TRPC client to be used on clients.
 */
export type { TRPCRouter } from "#routes/trpc.ts"
