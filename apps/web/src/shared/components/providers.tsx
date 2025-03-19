import type { ReactNode } from "react"

import { NextIntlClientProvider } from "@init/i18n/nextjs"
import { getMessages } from "@init/i18n/nextjs/server"
import { Toaster } from "@init/ui/sonner"
import { ThemeProvider } from "@init/ui/theme"
import { TooltipProvider } from "@init/ui/tooltip"

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
