import {
  type TRPCLink,
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { AnyTRPCRouter } from "@trpc/server"
import superjson from "superjson"

import { isDevelopment } from "./environment"

export const transformer = superjson

export function createTRPCClients<T extends AnyTRPCRouter>(url: string) {
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

  return {
    reactClient: createTRPCReact<T>(),
    vanillaClient: createTRPCClient<T>({ links }),
    links,
  }
}
