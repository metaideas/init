import { DEFAULT_LOCALE } from "@init/internationalization/locale"
import { isProduction } from "@init/utils/environment"
import { cn } from "@init/utils/ui"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import Providers from "~/shared/components/providers"
import { WebVitals } from "~/shared/logger"

// @ts-expect-error - TODO: will be fixed when moved to TanStack Start
import "@init/ui/globals.css"

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
      className="h-full"
      // TODO: We're passing the default locale instead of getting it from the
      // cookie because of a build error that happens with the not-found page.
      lang={DEFAULT_LOCALE}
      suppressHydrationWarning
    >
      {isProduction && <WebVitals />}
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
