import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { trpc, trpcReact } from "~/lib/trpc"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcReact} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
