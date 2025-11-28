import { ThemeProvider } from "@init/ui/components/theme"
import { THEME_STORAGE_KEY } from "@init/utils/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { queryClient } from "#shared/query-client.ts"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
