import type { Locale } from "@init/internationalization/locale"
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
} from "@init/internationalization/locale"
import {
  getRequestConfig,
  loadMessages,
} from "@init/internationalization/nextjs/server"
import { cookies } from "next/headers"

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
    messages: await loadMessages(locale),
  }
})
