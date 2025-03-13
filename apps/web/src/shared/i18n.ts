import { getLocale } from "@this/i18n/nextjs"
import { getRequestConfig } from "@this/i18n/nextjs/server"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await getLocale(requestLocale)

  return {
    locale,
    messages: (await import(`~~/translations/${locale}.json`)).default,
  }
})
