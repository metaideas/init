import type { Locale } from "../locale"

export async function loadMessages(locale: Locale) {
  return (await import(`../../translations/${locale}.json`)).default
}

export * from "next-intl/server"
