import type { ReactNode } from "react"

import { NextIntlClientProvider } from "@this/i18n/nextjs"
import { getMessages } from "@this/i18n/nextjs/server"
import { Toaster } from "@this/ui/sonner"
import { ThemeProvider } from "@this/ui/theme"
import { TooltipProvider } from "@this/ui/tooltip"

export default async function Providers({
  children,
}: Readonly<{ children: ReactNode }>) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
