import { type Logger, logger } from "@init/observability/logger"
import type { QueryClient } from "@tanstack/react-query"
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import Providers from "~/shared/components/providers"
import { queryClient } from "~/shared/query-client"
import { routeTree } from "./routeTree.gen"

import "@init/ui/globals.css"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
}

const history = createHashHistory()

const router = createRouter({
  routeTree,
  history,
  context: {
    queryClient,
    logger: logger.child({ group: "router" }),
  } satisfies RouterContext,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  Wrap: ({ children }) => <Providers>{children}</Providers>,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
