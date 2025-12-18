import { z } from "@init/utils/schema"
import { createRouter, publicProcedure } from "#shared/trpc.ts"

export default createRouter({
  checks: createRouter({
    emailAvailable: publicProcedure
      .input(z.object({ email: z.email() }))
      .query(async ({ input, ctx }) => {
        const user = await ctx.db.query.users.findFirst({
          where: (table, { eq }) => eq(table.email, input.email),
        })

        return { isAvailable: !user }
      }),
  }),
})
