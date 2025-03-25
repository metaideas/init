"use client"

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createTRPCClient,
  httpBatchLink,
  httpBatchStreamLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { type ReactNode, cache, useState } from "react"
import superjson from "superjson"

import { isDevelopment } from "@init/utils/environment"

import { makeQueryClient } from "~/shared/query-client"
import type { AppRouter } from "~/shared/trpc/router"
import { buildApiUrl } from "~/shared/utils"

let browserQueryClient: QueryClient | undefined

export const getQueryClient = cache(() => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one This is very
  // important, so we don't re-make a new client if React suspends during the
  // initial render. This may not be needed if we have a suspense boundary BELOW
  // the creation of the query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }

  return browserQueryClient
})

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
          condition: op => Boolean(op.context.streaming),
          false: httpBatchLink({ transformer: superjson, url }),
          true: httpBatchStreamLink({ transformer: superjson, url }),
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
