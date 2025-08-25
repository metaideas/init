"use client"

import {
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from "@tanstack/react-query"
import type { ReactNode } from "react"

export const queryClient = new QueryClient()

// Re-exporting the QueryClientProvider on a file with "use client"
export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProviderBase client={queryClient}>
      {children}
    </QueryClientProviderBase>
  )
}
