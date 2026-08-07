import { PasswordResetRequestError } from "@init/core/errors"
import * as z from "@init/utils/schema"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "#shared/auth.ts"
import { publicFunction } from "#shared/server/functions.ts"
import { buildUrl } from "#shared/utils.ts"

export const validateSession = createIsomorphicFn()
  .client(async () => {
    const { data: session } = await authClient.getSession()
    return session
  })
  .server(async () => {
    const { data: session } = await authClient.getSession({
      fetchOptions: { headers: getRequestHeaders() },
    })
    return session
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
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      fetchOptions: { headers: getRequestHeaders() },
      redirectTo: buildUrl("/reset-password"),
    })

    if (error) {
      throw new PasswordResetRequestError().withMessage(
        error.message ?? "Unable to request a password reset"
      )
    }
    return { success: true }
  })
