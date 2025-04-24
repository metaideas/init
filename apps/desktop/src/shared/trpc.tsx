import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { type ReactNode, useState } from "react"
import superjson from "superjson"

import { isDevelopment } from "@init/utils/environment"
import type { TRPCClient } from "api/client"
import { buildApiUrl } from "~/shared/utils"

const queryClient = new QueryClient()

export const {
  useTRPC,
  useTRPCClient,
  TRPCProvider: TRPCProviderBase,
} = createTRPCContext<TRPCClient>()

const url = buildApiUrl("/trpc")

export function TRPCProvider(props: Readonly<{ children: ReactNode }>) {
  const [trpcClient] = useState(() =>
    createTRPCClient<TRPCClient>({
      links: [
        loggerLink({ enabled: () => isDevelopment }),
        splitLink({
          condition: op => Boolean(op.context.skipBatch),
          false: httpBatchLink({ transformer: superjson, url }),
          true: httpLink({ transformer: superjson, url }),
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProviderBase trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProviderBase>
    </QueryClientProvider>
  )
}
