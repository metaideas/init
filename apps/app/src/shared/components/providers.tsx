import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { ReactNode } from "react"

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
