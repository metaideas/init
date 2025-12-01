import { type Logger, logger } from "@init/observability/logger"
import { initializeErrorMonitoring } from "@init/observability/monitoring"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import SuperJSON from "superjson"
import { routeTree } from "#routeTree.gen.ts"
import NotFound from "#shared/components/not-found.tsx"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
  cookies: Record<string, string | undefined>
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize },
    },
  })

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
      logger: logger.with({ group: "router" }),
      cookies: {},
    } satisfies RouterContext,
    defaultPreload: "intent",
    defaultNotFoundComponent: NotFound,
  })

  if (!router.isServer) {
    void initializeErrorMonitoring("client")
  }

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: true,
    handleRedirects: true,
  })

  return router
}
