import { initializeErrorMonitoring } from "@init/observability/monitoring/client"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import SuperJSON from "superjson"
import { routeTree } from "#routeTree.gen.ts"
import ErrorFallback from "#shared/components/error.tsx"
import NotFound from "#shared/components/not-found.tsx"
import { logger } from "#shared/logger.ts"

export type RouterContext = {
  queryClient: QueryClient
  logger: typeof logger
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize },
    },
  })

  const router = createRouter({
    context: {
      logger,
      queryClient,
    } satisfies RouterContext,
    defaultErrorComponent: ErrorFallback,
    defaultNotFoundComponent: NotFound,
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  })

  if (!router.isServer) {
    initializeErrorMonitoring()
  }

  setupRouterSsrQueryIntegration({
    handleRedirects: true,
    queryClient,
    router,
    wrapQueryClient: true,
  })

  return router
}
