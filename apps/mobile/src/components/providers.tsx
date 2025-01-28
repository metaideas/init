import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import type { ReactNode } from "react"
import { trpc } from "~/lib/trpc"
import { buildApiUrl } from "~/lib/utils"

const trpcUrl = buildApiUrl("/trpc")

console.log({ trpcUrl })

const queryClient = new QueryClient()
const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: trpcUrl })],
})

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
