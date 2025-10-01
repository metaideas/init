import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import type { ReactNode } from "react"

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
