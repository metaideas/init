import { slidingWindow } from "@init/security/ratelimit"
import * as z from "@init/utils/schema"

import { withRateLimitByIp } from "~/shared/trpc/middleware"
import { createRouter, publicProcedure } from "~/shared/trpc/server"

const checkEmailAvailability = publicProcedure
  .use(
    withRateLimitByIp("auth.checkEmailAvailability", slidingWindow(10, "60 s"))
  )
  .input(z.object({ email: z.string().email() }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, input.email),
    })

    return { isAvailable: !user }
  })

export default createRouter({
  checkEmailAvailability,
})
