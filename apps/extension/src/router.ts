import {
  createMemoryHistory,
  createRouter as createTanStackRouter,
} from "@tanstack/react-router"

import { routeTree } from "~/routeTree.gen"

const defaultRouter = createTanStackRouter({ routeTree })

export function createRouter(initialEntries: string[]) {
  const history = createMemoryHistory({ initialEntries })

  return createTanStackRouter({ routeTree, history })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof defaultRouter
  }
}
