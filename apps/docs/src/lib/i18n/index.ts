import type { I18nConfig } from "fumadocs-core/i18n"

import { DEFAULT_LOCALE, Locales } from "@this/common/constants"

export const i18n = {
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  languages: [Locales.EN, Locales.ES],
} satisfies I18nConfig
