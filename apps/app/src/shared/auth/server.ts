import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

import { auth } from "@this/auth/server"
import type { Session } from "@this/auth/server"

export const validateRequest = cache(async (): Promise<Session | null> => {
  const result = await auth.api.getSession({
    headers: await headers(),
  })

  if (!result) {
    return null
  }

  return result
})
