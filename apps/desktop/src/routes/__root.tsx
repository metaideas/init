import { Link, Outlet, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import "@init/ui/globals.css"
import { ThemeToggle } from "@init/ui/components/theme"

import Providers from "~/shared/components/providers"

export const Route = createRootRoute({
  component: () => (
    <Providers>
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex gap-2 p-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
          <Link to="/about" className="[&.active]:font-bold">
            About
          </Link>
        </div>
        <ThemeToggle />
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </Providers>
  ),
})
