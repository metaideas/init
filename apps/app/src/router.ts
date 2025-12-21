import { type Logger, logger } from "@init/observability/logger"
import { initializeErrorMonitoring } from "@init/observability/monitoring"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { createTRPCOptionsProxy, type TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { TRPCRouter } from "api/client"
import SuperJSON from "superjson"
import { routeTree } from "#routeTree.gen.ts"
import NotFound from "#shared/components/not-found.tsx"
import { makeTRPCClient } from "#shared/trpc.tsx"

export type RouterContext = {
  queryClient: QueryClient
  logger: Logger
  trpc: TRPCOptionsProxy<TRPCRouter>
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize },
    },
  })

  const trpcClient = makeTRPCClient()
  const trpc = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient,
  })

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
      logger: logger.getChild("router"),
      trpc,
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
