import type { I18nConfig } from "fumadocs-core/i18n"

import { DEFAULT_LOCALE } from "@init/internationalization/locale"
import { Locales } from "@init/utils/constants"

export const i18n = {
  defaultLanguage: DEFAULT_LOCALE,
  hideLocale: "default-locale",
  languages: [Locales.EN, Locales.ES],
} satisfies I18nConfig
