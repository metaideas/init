import { Inter } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

import "@init/ui/globals.css"
import { cn } from "@init/utils/ui"
import Providers from "~/shared/components/providers"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
