import type { Locale } from "@init/utils/constants"

export async function loadMessages(locale: Locale) {
  return (await import(`../../translations/${locale}.json`)).default
}

export * from "next-intl/server"
