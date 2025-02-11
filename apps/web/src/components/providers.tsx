import type { ReactNode } from "react"

import { Toaster } from "@this/ui/sonner"
import { ThemeProvider } from "@this/ui/theme"
import { TooltipProvider } from "@this/ui/tooltip"

export default function Providers({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
