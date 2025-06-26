import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { ThemeProvider } from "@init/ui/components/theme"

import { queryClient } from "~/shared/query-client"
import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
