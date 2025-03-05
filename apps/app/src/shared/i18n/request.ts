import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

import { DEFAULT_LOCALE, type Locale } from "@this/utils/constants"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale

  // If locale is not set, try to get it from the cookie
  if (!locale) {
    const cookieJar = await cookies()

    const localeCookie = cookieJar.get("locale")?.value ?? DEFAULT_LOCALE

    locale = localeCookie as Locale
  }

  return {
    locale,
    messages: (await import(`~~/translations/${locale}.json`)).default,
  }
})
