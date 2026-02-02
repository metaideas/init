import type { TRPCRouter } from "api/client"
import { initializeErrorMonitoring } from "@init/observability/monitoring/client"
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { createTRPCOptionsProxy, type TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import SuperJSON from "superjson"
import { routeTree } from "#routeTree.gen.ts"
import NotFound from "#shared/components/not-found.tsx"
import { logger } from "#shared/logger.ts"
import { makeTRPCClient, TRPCProvider } from "#shared/trpc.ts"

export type RouterContext = {
  queryClient: QueryClient
  logger: typeof logger
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
    Wrap: ({ children }) => (
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    ),
    context: {
      logger: logger.getChild("router"),
      queryClient,
      trpc,
    } satisfies RouterContext,
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
