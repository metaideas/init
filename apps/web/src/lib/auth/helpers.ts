import "server-only"

import { type Session, auth } from "@this/auth"
import { headers } from "next/headers"
import { cache } from "react"

export const validateRequest = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  return session
})
