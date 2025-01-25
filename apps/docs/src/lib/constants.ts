export const Locales = {
  EN: "en",
  ES: "es",
} as const
export type Locale = (typeof Locales)[keyof typeof Locales]

export const LOCALES = [Locales.EN, Locales.ES] as const
