import { isDevelopment } from "@init/utils/environment"
import { useQueryClient } from "@tanstack/react-query"
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { TRPCRouter } from "api/client"
import type { ReactNode } from "react"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

export const {
  useTRPC,
  useTRPCClient,
  TRPCProvider: TRPCProviderBase,
} = createTRPCContext<TRPCRouter>()

const url = buildApiUrl("/trpc")

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    loggerLink({ enabled: () => isDevelopment(), colorMode: "ansi" }),
    splitLink({
      condition: (op) =>
        Boolean(op.context.skipBatch) || isNonJsonSerializable(op.input),
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

export function TRPCProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  return (
    <TRPCProviderBase queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProviderBase>
  )
}
