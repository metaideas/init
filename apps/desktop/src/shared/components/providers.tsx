// import { ThemeProvider } from "@init/ui/components/theme"

import { ThemeProvider } from "@init/ui/components/theme"
import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { queryClient } from "#shared/query-client.ts"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
