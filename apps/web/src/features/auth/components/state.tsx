import type { ReactNode } from "react"

import { validateRequest } from "~/shared/auth/server"

export async function SignedIn({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (!session) {
    return null
  }

  return <>{children}</>
}

export async function SignedOut({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (session) {
    return null
  }

  return <>{children}</>
}
