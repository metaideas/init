import { ThemeProvider } from "@init/ui/theme"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { TRPCProvider, trpcClient } from "~/shared/trpc"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
