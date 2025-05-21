import { APP_ID, type Locale, Locales } from "@init/utils/constants"

export const DEFAULT_LOCALE: Locale = Locales.EN
export const LOCALES = Object.values(Locales) as [Locale, ...Locale[]]

export const LOCALE_COOKIE_NAME = `${APP_ID}-locale`
