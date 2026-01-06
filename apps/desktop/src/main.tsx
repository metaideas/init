import type { QueryClient } from "@tanstack/react-query"
import { type Logger, logger } from "@init/observability/logger"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "#routeTree.gen.ts"
import Providers from "#shared/components/providers.tsx"
import { queryClient } from "#shared/query-client.ts"

import "@init/ui/globals.css"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
}

const history = createHashHistory()

const router = createRouter({
  Wrap: ({ children }) => <Providers>{children}</Providers>,
  context: {
    logger: logger.with({ group: "router" }),
    queryClient,
  } satisfies RouterContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  history,
  routeTree,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.querySelector("#root")

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
