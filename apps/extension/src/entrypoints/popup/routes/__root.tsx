import { Link, Outlet, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import "~/assets/styles/tailwind.css"

export const Route = createRootRoute({
  component: () => (
    <main className="flex aspect-square w-[400px] flex-col items-center justify-center">
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/new" className="[&.active]:font-bold">
          New
        </Link>
      </div>
      <hr />
      <div className="flex-1">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </main>
  ),
})
