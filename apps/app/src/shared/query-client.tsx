"use client"
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query"
import type { ReactNode } from "react"
import superjson from "superjson"

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Set to 30 seconds to avoid refetching immediately in the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: make a new query client if we don't already have one This is very
  // important, so we don't re-make a new client if React suspends during the
  // initial render. This may not be needed if we have a suspense boundary BELOW
  // the creation of the query client
  browserQueryClient ??= makeQueryClient()

  return browserQueryClient
}

// Re-exporting the QueryClientProvider on a file with "use client"
export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProviderBase client={getQueryClient()}>
      {children}
    </QueryClientProviderBase>
  )
}
