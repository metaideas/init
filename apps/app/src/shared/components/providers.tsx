import { Toaster } from "@init/ui/components/sonner"
import { TooltipProvider } from "@init/ui/components/tooltip"
import type { ReactNode } from "react"
import { ThemeProvider } from "./theme"

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
