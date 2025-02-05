export const APP_NAME = "Init"
export const APP_ID = "init"

export const Locales = {
  EN: "en",
  ES: "es",
} as const
export type Locale = (typeof Locales)[keyof typeof Locales]
export const DEFAULT_LOCALE = Locales.EN
export const LOCALES = [Locales.EN, Locales.ES] as const

// Breakpoints
export const MOBILE_BREAKPOINT = 768
