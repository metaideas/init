import type { TRPCRouter } from "api/client"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

export const { useTRPC, useTRPCClient, TRPCProvider } = createTRPCContext<TRPCRouter>()

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
