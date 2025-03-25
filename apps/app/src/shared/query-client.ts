import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query"
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
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}
