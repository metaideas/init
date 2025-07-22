import { NextIntlClientProvider } from "@init/internationalization/nextjs"
import { getMessages } from "@init/internationalization/nextjs/server"
import { Toaster } from "@init/ui/components/sonner"
import { ThemeProvider } from "@init/ui/components/theme"
import { TooltipProvider } from "@init/ui/components/tooltip"
import type { ReactNode } from "react"
import { QueryClientProvider } from "~/shared/query-client"
import { TRPCProvider } from "~/shared/trpc/client"

export default async function Providers({
  children,
}: Readonly<{ children: ReactNode }>) {
  const messages = await getMessages()

  return (
    <QueryClientProvider>
      <TRPCProvider>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
