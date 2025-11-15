import { trpcServer } from "@hono/trpc-server"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import {
  createRouter,
  createTRPCContext,
  publicProcedure,
} from "#shared/trpc.ts"
import { factory } from "#shared/utils.ts"

/**
 * This is the main router for TRPC. It contains all the routes for this API.
 */
export const trpcRouter = createRouter({
  hello: publicProcedure.query(() => ({
    message: "Hello, this message is from the TRPC server!",
  })),
})

export type TRPCRouter = typeof trpcRouter
export type TRPCRouterOutput = inferRouterOutputs<typeof trpcRouter>
export type TRPCRouterInput = inferRouterInputs<typeof trpcRouter>

const trpc = factory.createApp().use(
  "/*",
  trpcServer({
    createContext: createTRPCContext,
    router: trpcRouter,
  })
)

export default trpc
