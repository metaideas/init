import * as z from "@init/utils/schema"
import {
  createRouter,
  protectedProcedure,
  publicProcedure,
} from "~/shared/trpc"
import { PublicUserSchema } from "~/shared/validation"

// Normally this would inside a `features/users` folder, but for this example
// we'll just keep it here.
const usersRouter = createRouter({
  list: protectedProcedure
    .output(z.array(PublicUserSchema))
    .query(async ({ ctx }) => {
      const existingUsers = await ctx.db.query.users.findMany()

      return existingUsers
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
