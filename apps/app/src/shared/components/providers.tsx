import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import { THEME_STORAGE_KEY, type Theme } from "@init/utils/constants"
import type { ReactNode } from "react"
import { setServerCookie } from "#shared/server/functions.ts"

export default function Providers({
  children,
  theme,
}: Readonly<{ children: ReactNode; theme: Theme }>) {
  return (
    <ThemeProvider
      setTheme={(value) =>
        setServerCookie({ data: { key: THEME_STORAGE_KEY, value } })
      }
      theme={theme}
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
