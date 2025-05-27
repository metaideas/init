import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import "@init/ui/globals.css"
import { getLocale } from "@init/internationalization/nextjs/server"
import { cn } from "@init/utils/ui"

import Providers from "~/shared/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  description: "A web app for the Init project",
  title: "Init Web",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale()

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
