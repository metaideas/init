import { transformer } from "@this/common/utils/trpc"
import { isDevelopment } from "@this/common/variables"
import {
  type TRPCLink,
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { TRPCClient } from "api/client"
import { buildApiUrl } from "~/lib/utils"

const url = buildApiUrl("/trpc")

export const trpc = createTRPCReact<TRPCClient>()

const links: TRPCLink<TRPCClient>[] = [
  loggerLink({ enabled: () => isDevelopment }),
  splitLink({
    condition: op => Boolean(op.context.skipBatch),
    true: httpLink({ url, transformer }),
    false: httpBatchLink({ url, transformer }),
  }),
]

export const trpcReact = trpc.createClient({ links })

export const trpcClient = createTRPCClient<TRPCClient>({ links })
