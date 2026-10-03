import type { PropsWithChildren } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@v1/ui/components/theme"
import { THEME_STORAGE_KEY } from "@v1/ui/constants"
import { queryClient } from "#shared/query-client.ts"

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
