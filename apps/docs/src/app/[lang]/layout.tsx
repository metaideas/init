import { I18nProvider, type Translations } from "fumadocs-ui/i18n"
import { RootProvider } from "fumadocs-ui/provider"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import es from "~/lib/i18n/translations/es"

import "~/assets/styles/tailwind.css"

const inter = Inter({
  subsets: ["latin"],
})

const translations: { [key: string]: Partial<Translations> } = { es }

export default async function Layout({
  params,
  children,
}: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const { lang } = await params

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <I18nProvider
          locale={lang}
          locales={[
            { name: "English", locale: "en" },
            { name: "Spanish", locale: "es" },
          ]}
          translations={translations[lang]}
        >
          <RootProvider>{children}</RootProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
