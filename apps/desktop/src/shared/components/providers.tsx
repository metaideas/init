import type { PropsWithChildren } from "react"
import { ThemeProvider } from "@init/ui/components/theme"
import { THEME_STORAGE_KEY } from "@init/ui/constants"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "#shared/query-client.ts"

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
