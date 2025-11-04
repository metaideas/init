import { type Logger, logger } from "@init/observability/logger"
import { initializeErrorMonitoring } from "@init/observability/monitoring"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import superjson from "superjson"
import NotFound from "~/shared/components/not-found"
import { routeTree } from "./routeTree.gen"
import Providers from "./shared/components/providers"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  })

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
      logger: logger.child({ group: "router" }),
    } satisfies RouterContext,
    defaultNotFoundComponent: NotFound,
    Wrap: ({ children }) => <Providers>{children}</Providers>,
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
