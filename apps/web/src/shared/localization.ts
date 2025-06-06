import { hasLocale, routing } from "@init/internationalization/nextjs"
import {
  getRequestConfig,
  loadMessages,
} from "@init/internationalization/nextjs/server"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
