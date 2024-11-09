import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "@this/tailwind/globals.css"
import { cn } from "@this/ui/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans", inter.variable)}>{children}</body>
    </html>
  )
}
