import "server-only"

import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query"
import { cache, type ReactNode } from "react"
import { makeQueryClient } from "~/shared/query-client"
import { appRouter } from "~/shared/trpc/router"
import { createContext } from "~/shared/trpc/server"

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
})

export function HydrateClient(props: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  )
}
// biome-ignore lint/suspicious/noExplicitAny: query options are provided by TRPC
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // biome-ignore lint/suspicious/noExplicitAny: query options are provided by TRPC
    queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    queryClient.prefetchQuery(queryOptions)
  }
}
