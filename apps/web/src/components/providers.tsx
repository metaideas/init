import { Toaster } from "@this/ui/components/sonner"
import { TooltipProvider } from "@this/ui/components/tooltip"
import { ThemeProvider } from "next-themes"

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
