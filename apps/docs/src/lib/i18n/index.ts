import type { I18nConfig } from "fumadocs-core/i18n"
import { Locales } from "~/lib/constants"

export const i18n = {
  defaultLanguage: Locales.EN,
  languages: [Locales.EN, Locales.ES],
  hideLocale: "default-locale",
} satisfies I18nConfig
