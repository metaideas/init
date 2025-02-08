import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { Toaster } from "@this/ui/sonner"
import { TooltipProvider } from "@this/ui/tooltip"

export default function Providers({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
