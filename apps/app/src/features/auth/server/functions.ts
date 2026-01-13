// Add your global server functions here

import * as z from "@init/utils/schema"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { authClient } from "#shared/auth.ts"
import { publicFunction } from "#shared/server/functions.ts"

export const validateSession = createIsomorphicFn()
  .client(async () => {
    const { data: session } = await authClient.getSession()

    return session
  })
  .server(async () => {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    })

    return session
  })

export const forgotPassword = publicFunction
  .inputValidator(z.object({ email: z.email() }))
  .handler(async ({ data, context }) => {
    context.logger.info("Mocking forgot password", data)

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })

    return { success: true }
  })
