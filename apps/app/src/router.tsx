import { type Logger, logger } from "@init/observability/logger"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import superjson from "superjson"
import NotFound from "~/shared/components/not-found"
import { routeTree } from "./routeTree.gen"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
  cookies: Record<string, string | undefined>
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
      cookies: {},
    } satisfies RouterContext,
    defaultNotFoundComponent: NotFound,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: true,
    handleRedirects: true,
  })

  return router
}
