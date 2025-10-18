import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { UNAUTHENTICATED_PATHNAME } from "~/features/auth/constants"
import { validateSession } from "~/features/auth/server/functions"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await validateSession()

    if (!session) {
      throw redirect({ to: UNAUTHENTICATED_PATHNAME })
    }

    return { session }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
  return <Outlet />
}
