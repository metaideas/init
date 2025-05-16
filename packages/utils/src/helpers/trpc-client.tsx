import { type QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createTRPCClient as createTRPCClientBase,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { type ReactNode, useState } from "react"
import superjson from "superjson"

import { isDevelopment } from "./environment"

export function createTRPCClient<TRouter>(
  url: string,
  queryClient: QueryClient
) {
  const {
    useTRPC,
    useTRPCClient,
    TRPCProvider: TRPCProviderBase,
    // @ts-expect-error - @trpc/client doesn't expose the router type
  } = createTRPCContext<TRouter>()

  function TRPCProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [trpcClient] = useState(() =>
      // @ts-expect-error - @trpc/client doesn't expose the router type
      createTRPCClientBase<TRouter>({
        links: [
          loggerLink({ enabled: () => isDevelopment }),
          splitLink({
            condition: op =>
              Boolean(op.context.skipBatching) ||
              isNonJsonSerializable(op.context.result),
            false: httpBatchLink({ transformer: superjson, url }),
            true: httpLink({ transformer: superjson, url }),
          }),
        ],
      })
    )

    return (
      <QueryClientProvider client={queryClient}>
        <TRPCProviderBase trpcClient={trpcClient} queryClient={queryClient}>
          {children}
        </TRPCProviderBase>
      </QueryClientProvider>
    )
  }

  return { useTRPC, useTRPCClient, TRPCProvider }
}
