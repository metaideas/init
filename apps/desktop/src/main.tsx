import type { QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@init/ui/components/theme"
import { THEME_STORAGE_KEY } from "@init/ui/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "#routeTree.gen.ts"
import { logger } from "#shared/logger.ts"
import { queryClient } from "#shared/query-client.ts"

import "@init/ui/globals.css"

export type RouterContext = {
  queryClient: QueryClient
  logger: typeof logger
}

const history = createHashHistory()

const router = createRouter({
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>{children}</ThemeProvider>
    </QueryClientProvider>
  ),
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
