import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@this/ui/theme"
import type { ReactNode } from "react"

import { TRPCProvider, useTRPCClient } from "~/shared/trpc"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  const trpc = useTRPCClient()

  return (
    <TRPCProvider client={trpc} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </TRPCProvider>
  )
}
