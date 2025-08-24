import { DEFAULT_LOCALE, Locales } from "@init/internationalization/locale"
import { defineI18n } from "fumadocs-core/i18n"

export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  languages: [Locales.EN, Locales.ES],
})
