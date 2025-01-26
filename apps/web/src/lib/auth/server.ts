import "server-only"

import { type Session, auth } from "@this/auth/server"
import { headers } from "next/headers"
import { cache } from "react"

export const validateRequest = cache(async (): Promise<Session | null> => {
  const result = await auth.api.getSession({
    headers: await headers(),
  })

  if (!result) {
    return null
  }

  return result
})
