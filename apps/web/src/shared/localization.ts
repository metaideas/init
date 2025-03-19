import { getLocale } from "@init/internationalization/nextjs"
import {
  getRequestConfig,
  loadMessages,
} from "@init/internationalization/nextjs/server"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await getLocale(requestLocale)

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
