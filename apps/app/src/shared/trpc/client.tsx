"use client"

import { isDevelopment } from "@init/utils/environment"
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
import { getQueryClient } from "~/shared/query-client"
import type { AppRouter } from "~/shared/trpc/router"
import { buildApiUrl } from "~/shared/utils"

const url = buildApiUrl("/trpc")

export const {
  useTRPC,
  useTRPCClient,
  TRPCProvider: TRPCProviderBase,
} = createTRPCContext<AppRouter>()

export function TRPCProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({ enabled: () => isDevelopment, colorMode: "ansi" }),
        splitLink({
          condition: (op) =>
            Boolean(op.context.skipBatching) ||
            isNonJsonSerializable(op.context.result),
          false: httpBatchLink({
            transformer: superjson,
            url,
          }),
          true: httpLink({
            transformer: superjson,
            url,
          }),
        }),
      ],
    })
  )

  return (
    <TRPCProviderBase queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProviderBase>
  )
}
