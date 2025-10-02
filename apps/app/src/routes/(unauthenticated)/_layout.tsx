import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AUTHENTICATED_PATHNAME } from "~/features/auth/constants"
import { validateSession } from "~/features/auth/server/functions"

export const Route = createFileRoute("/(unauthenticated)/_layout")({
  beforeLoad: async () => {
    const session = await validateSession()

    if (session) {
      throw redirect({ to: AUTHENTICATED_PATHNAME })
    }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return <Outlet />
}
