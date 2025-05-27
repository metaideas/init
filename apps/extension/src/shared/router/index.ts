import {
  createMemoryHistory,
  createRouter as createTanStackRouter,
} from "@tanstack/react-router"

import { routeTree } from "~/shared/router/routeTree.gen"

const _defaultRouter = createTanStackRouter({ routeTree })
type Router = typeof _defaultRouter

export function createRouter(entrypoint: keyof Router["routesByPath"]) {
  // Create memory history for browser extension context. Each entrypoint can
  // specify its starting route.
  const history = createMemoryHistory({ initialEntries: [entrypoint] })

  return createTanStackRouter({ history, routeTree })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: Router
  }
}
