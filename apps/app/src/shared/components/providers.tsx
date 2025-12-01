import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import type { Theme } from "@init/utils/constants"
import type { ReactNode } from "react"
import { setTheme } from "#features/theme/server/functions.ts"

export default function Providers({
  children,
  theme,
}: Readonly<{ children: ReactNode; theme: Theme }>) {
  return (
    <ThemeProvider
      setTheme={(value) => setTheme({ data: value })}
      theme={theme}
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
