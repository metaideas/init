import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import FontLoader from "~/components/font-loader"
import ThemeProvider from "~/components/theme-provider"
import { trpc, trpcReact } from "~/lib/trpc"

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcReact} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <FontLoader>
          <ThemeProvider>{children}</ThemeProvider>
        </FontLoader>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
