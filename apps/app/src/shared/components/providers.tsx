import type { Theme } from "@init/ui/constants"
import type { ReactNode } from "react"
import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"

export default function Providers({
  children,
  setTheme,
  theme,
}: Readonly<{ children: ReactNode; setTheme: (theme: Theme) => void; theme: Theme }>) {
  return (
    <ThemeProvider setTheme={setTheme} theme={theme}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
