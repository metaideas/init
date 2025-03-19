import { cookies } from "next/headers"

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@init/internationalization/locale"
import { getRequestConfig } from "@init/internationalization/nextjs/server"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined

  // If locale is not set, try to get it from the cookie
  if (!locale) {
    const cookieJar = await cookies()

    const localeCookie = cookieJar.get(LOCALE_COOKIE_NAME)

    locale = (localeCookie?.value ?? DEFAULT_LOCALE) as Locale
  }

  return {
    locale,
    messages: (await import(`~~/translations/${locale}.json`)).default,
  }
})
