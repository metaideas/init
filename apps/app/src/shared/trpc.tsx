import type { TRPCRouter } from "api/client"
import type { ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

const { useTRPC, useTRPCClient, TRPCProvider: TRPCProviderBase } = createTRPCContext<TRPCRouter>()

const url = buildApiUrl("/trpc")
const isDevelopment = import.meta.env.DEV

export const makeTRPCClient = createIsomorphicFn()
  .server(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        httpBatchStreamLink({
          headers: getRequestHeaders,
          transformer: superjson,
          url,
        }),
      ],
    })
  )
  .client(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        loggerLink({ colorMode: "ansi", enabled: () => isDevelopment }),
        httpBatchStreamLink({
          fetch: (requestUrl, options) =>
            fetch(requestUrl, {
              ...options,
              credentials: "include",
            }),
          transformer: superjson,
          url,
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
