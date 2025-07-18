import type { ReactNode } from "react"
import { validateRequest } from "~/shared/auth/server"

export async function Authenticated({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (!session) {
    return null
  }

  return <>{children}</>
}

export async function Unauthenticated({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (session) {
    return null
  }

  return <>{children}</>
}
