import { createRouter, publicProcedure } from "~/shared/trpc"

/**
 * This is the main router for TRPC. It contains all the routes for this API.
 */
export const trpcRouter = createRouter({
  hello: publicProcedure.query(() => ({
    message: "Hello, this message is from the TRPC server!",
  })),
})
