import {
  createRouter,
  protectedProcedure,
  publicProcedure,
} from "~/shared/trpc"

// Normally this would inside a `features/users` folder, but for this example
// we'll just keep it here.
const usersRouter = createRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.users.findMany()
  }),
})

/**
 * This is the main router for TRPC. It contains all the routes for this API.
 */
export const trpcRouter = createRouter({
  hello: publicProcedure.query(() => {
    return {
      message: "Hello, this message is from the TRPC server!",
    }
  }),
  users: usersRouter,
})
