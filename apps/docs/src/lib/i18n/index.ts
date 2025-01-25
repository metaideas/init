import { DEFAULT_LOCALE, Locales } from "@this/common/constants"
import type { I18nConfig } from "fumadocs-core/i18n"

export const i18n = {
  defaultLanguage: DEFAULT_LOCALE,
  languages: [Locales.EN, Locales.ES],
  hideLocale: "default-locale",
} satisfies I18nConfig
