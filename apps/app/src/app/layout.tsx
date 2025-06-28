import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import "@init/ui/globals.css"
import { DEFAULT_LOCALE } from "@init/internationalization/locale"
import { cn } from "@init/utils/ui"
import Providers from "~/shared/components/providers"
import { WebVitals } from "~/shared/logger"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  description: "A web app for the Init project",
  title: "Init Web",
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      // TODO: We're passing the default locale instead of getting it from the
      // cookie because of a build error that happens with not-found.
      className="h-full"
      lang={DEFAULT_LOCALE}
      suppressHydrationWarning
    >
      <WebVitals />
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
