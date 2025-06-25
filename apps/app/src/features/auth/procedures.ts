import { slidingWindow } from "@init/security/ratelimit"
import * as z from "@init/utils/schema"

import { withRateLimitByIp } from "~/shared/trpc/middleware"
import { createRouter, publicProcedure } from "~/shared/trpc/server"

const checkEmailAvailability = publicProcedure
  .use(
    withRateLimitByIp("auth.checkEmailAvailability", slidingWindow(10, "60 s"))
  )
  .input(z.object({ email: z.email() }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, input.email),
    })

    return { isAvailable: !user }
  })

export default createRouter({
  checkEmailAvailability,
})
