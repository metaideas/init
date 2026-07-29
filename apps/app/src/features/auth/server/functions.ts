import * as z from "@init/utils/schema"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "#features/auth/server/index.ts"
import { publicFunction } from "#shared/server/functions.ts"
import { buildUrl } from "#shared/utils.ts"

async function getCurrentSession() {
  return auth.api.getSession({ headers: getRequestHeaders() })
}

export const validateSession = publicFunction.handler(getCurrentSession)

export const getGreeting = publicFunction.handler(async () => {
  const session = await getCurrentSession()
  if (!session) throw new Error("Unauthorized")

  return { message: `Hello, ${session.user.name}!` }
})

export const checkEmailAvailability = publicFunction
  .validator(z.object({ email: z.email() }))
  .handler(async ({ context, data }) => {
    const user = await context.database.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
    })

    return { isAvailable: !user }
  })

export const forgotPassword = publicFunction
  .validator(z.object({ email: z.email() }))
  .handler(async ({ data }) => {
    await auth.api.requestPasswordReset({
      body: {
        email: data.email,
        redirectTo: buildUrl("/reset-password"),
      },
      headers: getRequestHeaders(),
    })

    return { success: true }
  })
