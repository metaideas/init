import { I18nProvider } from "fumadocs-ui/i18n"
import type { Translations } from "fumadocs-ui/i18n"
import { RootProvider } from "fumadocs-ui/provider"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import "~/shared/assets/styles/index.css"
import es from "~/shared/localization/translations/es"

const inter = Inter({
  subsets: ["latin"],
})

const translations: Record<string, Partial<Translations>> = { es }

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>
  children: ReactNode
}) {
  const { lang } = await params

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <I18nProvider
          locale={lang}
          locales={[
            { locale: "en", name: "English" },
            { locale: "es", name: "Spanish" },
          ]}
          translations={translations[lang]}
        >
          <RootProvider>{children}</RootProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
