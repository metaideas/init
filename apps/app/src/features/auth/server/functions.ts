// Add your global server functions here

import { slidingWindow } from "@init/security/ratelimit"
import { z } from "@init/utils/schema"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "~/shared/auth/client"
import { auth } from "~/shared/auth/server"
import { publicFunction } from "~/shared/server/functions"
import { withRateLimitByIp } from "~/shared/server/middleware"

export const validateSession = createIsomorphicFn()
  .client(async () => {
    const { data: session } = await authClient.getSession()

    if (!session) {
      return null
    }

    return session
  })
  .server(async () => {
    const session = await auth.api.getSession({
      headers: await getRequestHeaders(),
    })

    if (!session) {
      return null
    }

    return session
  })

export const checkEmailAvailability = publicFunction
  .middleware([
    withRateLimitByIp("auth.check-email-availability", slidingWindow(1, "1 m")),
  ])
  .inputValidator(z.object({ email: z.email() }))
  .handler(async ({ data, context }) => {
    const user = await context.db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
    })

    return { isAvailable: !user }
  })
