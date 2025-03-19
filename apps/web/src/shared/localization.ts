import { getLocale } from "@init/internationalization/nextjs"
import { getRequestConfig } from "@init/internationalization/nextjs/server"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await getLocale(requestLocale)

  return {
    locale,
    messages: (await import(`~~/translations/${locale}.json`)).default,
  }
})
