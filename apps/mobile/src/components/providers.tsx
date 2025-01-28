import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { transformer } from "@this/common/utils/trpc"
import { isDevelopment } from "@this/common/variables"
import { httpBatchLink, httpLink, loggerLink, splitLink } from "@trpc/client"
import type { ReactNode } from "react"
import { trpc } from "~/lib/trpc"
import { buildApiUrl } from "~/lib/utils"

const url = buildApiUrl("/trpc")
const queryClient = new QueryClient()

const trpcClient = trpc.createClient({
  links: [
    splitLink({
      // Skip batching for all operations with context property `skipBatch`
      condition: op => Boolean(op.context.skipBatch),
      true: httpLink({ url, transformer }),
      false: httpBatchLink({ url, transformer }),
    }),
    loggerLink({ enabled: () => isDevelopment }),
  ],
})

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
