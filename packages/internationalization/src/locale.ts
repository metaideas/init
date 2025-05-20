import { APP_ID } from "@init/utils/constants"

export const Locales = {
  EN: "en",
  ES: "es",
} as const
export type Locale = (typeof Locales)[keyof typeof Locales]
export const DEFAULT_LOCALE = Locales.EN
export const LOCALES = Object.values(Locales) as [Locale, ...Locale[]]

export const LOCALE_COOKIE_NAME = `${APP_ID}-locale`
