import { isDevelopment } from "@init/utils/environment"
import { useQueryClient } from "@tanstack/react-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { TRPCRouter } from "api/client"
import type { ReactNode } from "react"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

const { useTRPC, useTRPCClient, TRPCProvider: TRPCProviderBase } = createTRPCContext<TRPCRouter>()

const url = buildApiUrl("/trpc")

export const makeTRPCClient = createIsomorphicFn()
  .server(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        httpBatchStreamLink({
          transformer: superjson,
          url,
          headers: getRequestHeaders,
        }),
      ],
    })
  )
  .client(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        loggerLink({ enabled: () => isDevelopment(), colorMode: "ansi" }),
        httpBatchStreamLink({
          transformer: superjson,
          url,
          fetch: (requestUrl, options) =>
            fetch(requestUrl, {
              ...options,
              credentials: "include",
            }),
        }),
      ],
    })
  )

const trpcClient = makeTRPCClient()

function TRPCProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  return (
    <TRPCProviderBase queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProviderBase>
  )
}

export { useTRPC, useTRPCClient, TRPCProvider }
