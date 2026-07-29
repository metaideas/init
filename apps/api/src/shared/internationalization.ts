import { baseLocale, type Locale, locales } from "#shared/internationalization/runtime.js"

function checkIsLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export function getRequestLocale(acceptLanguage: string | undefined): Locale {
  const requestedLocales =
    acceptLanguage
      ?.split(",")
      .map((entry, index) => {
        const [languageRange = "", ...parameters] = entry.trim().toLowerCase().split(";")
        const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="))
        const quality = qualityParameter ? Number.parseFloat(qualityParameter.trim().slice(2)) : 1

        return {
          index,
          language: languageRange.split("-")[0] ?? "",
          quality: Number.isFinite(quality) ? quality : 0,
        }
      })
      .toSorted((left, right) => right.quality - left.quality || left.index - right.index) ?? []

  for (const requestedLocale of requestedLocales) {
    if (requestedLocale.quality <= 0) continue
    if (checkIsLocale(requestedLocale.language)) return requestedLocale.language
  }

  return baseLocale
}
