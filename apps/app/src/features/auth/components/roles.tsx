import type { ReactNode } from "react"

import { validateRequest } from "~/shared/auth/server"

export async function AdminOnly({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await validateRequest()

  if (session?.user.role !== "admin") {
    return null
  }

  return <>{children}</>
}

export async function UserOnly({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await validateRequest()

  if (session?.user.role !== "user") {
    return null
  }

  return <>{children}</>
}
