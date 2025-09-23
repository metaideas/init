import { baseLocale, locales } from "@init/internationalization/runtime"
import { defineI18n } from "fumadocs-core/i18n"

export const i18n = defineI18n({
  defaultLanguage: baseLocale,
  hideLocale: "default-locale",
  languages: [...locales],
})
