import { cn } from "@init/utils/ui"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import Providers from "~/shared/components/providers"

// @ts-expect-error - TODO: will be fixed when moved to TanStack Router
import "@init/ui/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className={cn("font-sans", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
