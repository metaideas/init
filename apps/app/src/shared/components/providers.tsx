import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import type { Theme } from "@init/utils/constants"
import type { ReactNode } from "react"
import { ThemeScript } from "#features/theme/components/theme-script.tsx"
import { setTheme } from "#features/theme/server/functions.ts"
import { TRPCProvider } from "#shared/trpc.tsx"

export default function Providers({
  children,
  theme,
}: Readonly<{ children: ReactNode; theme: Theme }>) {
  return (
    <TRPCProvider>
      <ThemeProvider
        setTheme={(value) => setTheme({ data: value })}
        theme={theme}
      >
        <ThemeScript />
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </TRPCProvider>
  )
}
