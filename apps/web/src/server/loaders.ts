import { redirect } from "next/navigation"
import { cache } from "react"
import { validateRequest } from "~/lib/auth/server"
import { UNAUTHORIZED_PATHNAME } from "~/lib/constants"

export const getCurrentUser = cache(async () => {
  const session = await validateRequest()

  if (!session) {
    redirect(UNAUTHORIZED_PATHNAME)
  }

  return session?.user
})
