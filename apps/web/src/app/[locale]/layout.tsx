import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { ReactNode } from "react"

export default async function Layout({ children }: { children: ReactNode }) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
