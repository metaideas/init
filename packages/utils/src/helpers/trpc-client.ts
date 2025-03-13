import {
  type TRPCLink,
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import type { AnyTRPCRouter } from "@trpc/server"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import superjson from "superjson"

import { isDevelopment } from "./environment"

export const transformer = superjson

export function createTRPC<T extends AnyTRPCRouter>(url: string) {
  const links: TRPCLink<T>[] = [
    loggerLink({ enabled: () => isDevelopment }),
    splitLink({
      condition: op => Boolean(op.context.skipBatch),
      // @ts-expect-error -- Generic router types doesn't play well with transformers
      false: httpBatchLink({ transformer: superjson, url }),
      // @ts-expect-error -- Generic router types doesn't play well with transformers
      true: httpLink({ transformer: superjson, url }),
    }),
  ]

  const trpcClient = createTRPCClient<T>({ links })

  return {
    ...createTRPCContext<T>(),
    trpcClient,
  }
}
