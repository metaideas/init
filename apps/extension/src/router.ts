import {
  createMemoryHistory,
  createRouter as createTanStackRouter,
} from "@tanstack/react-router"

import { routeTree } from "~/routeTree.gen"

const _defaultRouter = createTanStackRouter({ routeTree })

export function createRouter(initialEntries: string[]) {
  const history = createMemoryHistory({ initialEntries })

  return createTanStackRouter({ history, routeTree })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof _defaultRouter
  }
}
