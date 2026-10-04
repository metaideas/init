import type { Theme } from "@v1/ui/constants"
import type { ReactNode } from "react"
import { ThemeProvider } from "@v1/ui/components/theme"
import { Toaster } from "@v1/ui/components/toast"
import { TooltipProvider } from "@v1/ui/components/tooltip"

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
