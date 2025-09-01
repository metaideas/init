import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "@init/ui/globals.css"

import { Plausible } from "@init/analytics/web"
import { getLocale } from "@init/internationalization/nextjs/server"
import { cn } from "@init/utils/ui"
import Providers from "~/shared/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  description: "A marketing site for the Init project",
  title: "Init Web",
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale()

  return (
    <html className="h-full" lang={locale} suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable)}>
        <Plausible domain="init.now" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
