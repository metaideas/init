import type { ReactNode } from "react"

import ThemeProvider from "~/shared/components/theme-provider"
import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </TRPCProvider>
  )
}
