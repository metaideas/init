import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import type { TRPCLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { TRPCClient } from "api/client"

import { transformer } from "@this/common/utils/trpc"
import { isDevelopment } from "@this/common/variables"

import { buildApiUrl } from "~/lib/utils"

const url = buildApiUrl("/trpc")

export const trpc = createTRPCReact<TRPCClient>()

const links: TRPCLink<TRPCClient>[] = [
  loggerLink({ enabled: () => isDevelopment }),
  splitLink({
    condition: op => Boolean(op.context.skipBatch),
    false: httpBatchLink({ transformer, url }),
    true: httpLink({ transformer, url }),
  }),
]

export const trpcReact = trpc.createClient({ links })

export const trpcClient = createTRPCClient<TRPCClient>({ links })
