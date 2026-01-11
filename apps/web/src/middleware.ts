import { type Locale, overwriteGetLocale } from "@init/internationalization/runtime"
import { defineMiddleware } from "astro:middleware"

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export const onRequest = defineMiddleware((context, next) => {
  // Grab the locale from Astro based on the URL and overwrite the `getLocale`
  // function to use it
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  overwriteGetLocale(() => context.currentLocale as Locale)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  return next()
})
