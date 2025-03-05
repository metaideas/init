import { redirect } from "next/navigation"
import { cache } from "react"

import { validateRequest } from "~/shared/auth/server"
import { UNAUTHORIZED_PATHNAME } from "~/shared/constants"

export const getCurrentUser = cache(async () => {
  const session = await validateRequest()

  if (!session) {
    redirect(UNAUTHORIZED_PATHNAME)
  }

  return session.user
})
