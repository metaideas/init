import type { ReactNode } from "react"
import { useSession } from "#shared/auth/client.ts"

export function AdminOnly({ children }: Readonly<{ children: ReactNode }>) {
  const { data: session } = useSession()

  if (session?.user.role !== "admin") {
    return null
  }

  return <>{children}</>
}

export function UserOnly({ children }: Readonly<{ children: ReactNode }>) {
  const { data: session } = useSession()

  if (session?.user.role !== "admin") {
    return null
  }

  return <>{children}</>
}
