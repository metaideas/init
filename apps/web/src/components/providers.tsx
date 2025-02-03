import { Toaster } from "@this/ui/web/components/sonner"
import { TooltipProvider } from "@this/ui/web/components/tooltip"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

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
