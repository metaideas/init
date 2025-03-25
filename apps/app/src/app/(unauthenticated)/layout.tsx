import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { validateRequest } from "~/shared/auth/server"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await validateRequest()

  if (session) {
    redirect(AUTHORIZED_PATHNAME)
  }

  return <>{children}</>
}
