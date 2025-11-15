import { hc } from "hono/client"
import type { router } from "#routes/index.ts"
import type { trpcRouter } from "#routes/trpc.ts"

export const client = (
  ...args: Parameters<typeof hc>
): ReturnType<typeof hc<typeof router>> => hc<typeof router>(...args)

/**
 * This is the type of the TRPC client to be used on clients.
 */
export type TRPCRouter = typeof trpcRouter
