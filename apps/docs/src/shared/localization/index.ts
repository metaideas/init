import { DEFAULT_LOCALE, Locales } from "@init/internationalization/locale"
import type { I18nConfig } from "fumadocs-core/i18n"

export const i18n = {
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  languages: [Locales.EN, Locales.ES],
} satisfies I18nConfig
