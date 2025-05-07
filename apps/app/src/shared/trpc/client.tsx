"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { type ReactNode, useState } from "react"
import superjson from "superjson"

import { isDevelopment } from "@init/utils/environment"

import { getQueryClient } from "~/shared/query-client"
import type { AppRouter } from "~/shared/trpc/router"
import { buildApiUrl } from "~/shared/utils"

// In this implementation we're providing the app router to the Next.js server,
// but we could easily swipe it out with the router in the API project and use
// that as our backend.
export const {
  useTRPC,
  useTRPCClient,
  TRPCProvider: TRPCProviderBase,
} = createTRPCContext<AppRouter>()

const url = buildApiUrl("/trpc")

export function TRPCProvider(
  props: Readonly<{
    children: ReactNode
  }>
) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
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
        {props.children}
      </TRPCProviderBase>
    </QueryClientProvider>
  )
}
