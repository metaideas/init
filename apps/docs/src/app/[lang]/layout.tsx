import { Locales } from "@init/internationalization/locale"
import type { Translations } from "fumadocs-ui/i18n"
import { RootProvider } from "fumadocs-ui/provider"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

// @ts-expect-error - TODO: will be fixed when moved to TanStack Start
import "~/shared/assets/styles/globals.css"
import es from "~/shared/localization/translations/es"

const inter = Inter({
  subsets: ["latin"],
})

const translations: Record<string, Partial<Translations>> = {
  es,
}

const locales = [
  {
    locale: Locales.EN,
    name: "English",
  },
  {
    locale: Locales.ES,
    name: "Spanish",
  },
]

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>
  children: ReactNode
}) {
  const { lang } = await params

  return (
    <html className={inter.className} lang={lang} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          i18n={{
            locale: lang,
            locales,
            translations: translations[lang],
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
