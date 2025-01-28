import { router } from "~/lib/trpc"
import { publicProcedure } from "~/lib/trpc"

// Normally this would inside a `features/users` folder, but for this example
// we'll just keep it here.
const usersRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.users.findMany()
  }),
})

export const trpcRouter = router({
  hello: publicProcedure.query(() => {
    return {
      message: "Hello from TRPC!",
    }
  }),
  users: usersRouter,
})
