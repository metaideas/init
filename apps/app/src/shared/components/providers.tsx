import type { Theme } from "@init/ui/constants"
import type { ReactNode } from "react"
import { ThemeProvider } from "@init/ui/components/theme"
import { Toaster } from "@init/ui/components/toast"
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
