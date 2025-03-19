import type { I18nConfig } from "fumadocs-core/i18n"

import { DEFAULT_LOCALE, Locales } from "@init/i18n/locale"

export const i18n = {
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  languages: [Locales.EN, Locales.ES],
} satisfies I18nConfig
