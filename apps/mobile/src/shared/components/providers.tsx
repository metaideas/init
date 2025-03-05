import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import ThemeProvider from "~/shared/components/theme-provider"
import { TRPCProvider, useTRPCClient } from "~/shared/trpc"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  const trpcClient = useTRPCClient()

  return (
    <TRPCProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </TRPCProvider>
  )
}
