import type { QueryClient } from "@tanstack/react-query"
import { configureLogger } from "@init/observability/logger"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "#routeTree.gen.ts"
import Providers from "#shared/components/providers.tsx"
import { logger } from "#shared/logger.ts"
import { queryClient } from "#shared/query-client.ts"

import "@init/ui/globals.css"

configureLogger({ isDevelopment: import.meta.env.DEV })

export type RouterContext = {
  queryClient: QueryClient
  logger: typeof logger
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
