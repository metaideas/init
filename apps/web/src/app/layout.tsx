import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import { cn } from "@init/utils/classname"

import Providers from "~/shared/components/providers"

import "~/shared/assets/styles/tailwind.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  description: "A marketing site for the Init project",
  title: "Init Web",
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
