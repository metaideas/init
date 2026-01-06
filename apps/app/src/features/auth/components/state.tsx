import type { ReactNode } from "react"
import { useSession } from "#shared/auth.ts"

export function Authenticated({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()

  if (!session || isPending) {
    return null
  }

  return children
}

export function Unauthenticated({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession()

  if (session || isPending) {
    return null
  }

  return children
}
