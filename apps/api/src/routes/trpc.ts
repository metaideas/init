import { trpcServer } from "@hono/trpc-server"
import authProcedures from "#features/auth/procedures.ts"
import { createRouter, createTRPCContext, protectedProcedure } from "#shared/trpc.ts"
import { factory } from "#shared/utils.ts"

/**
 * This is the main router for TRPC. It contains all the routes for this API.
 */
export const trpcRouter = createRouter({
  auth: authProcedures,
  hello: protectedProcedure.query(() => ({
    message: "Hello, this message is from the TRPC server!",
  })),
})

export type TRPCRouter = typeof trpcRouter

/**
 * The TRPC router is used to handle all TRPC requests by the TRPC client.
 */
export default factory.createApp().use(
  "/*",
  trpcServer({
    createContext: createTRPCContext,
    router: trpcRouter,
  })
)
