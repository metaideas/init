import { ThemeProvider } from "@init/ui/components/theme"
import type { ReactNode } from "react"

import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </TRPCProvider>
  )
}
