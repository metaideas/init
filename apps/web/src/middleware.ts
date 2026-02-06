import { defineMiddleware } from "astro:middleware"
import { type Locale, overwriteGetLocale } from "#shared/internationalization/runtime.js"

export const onRequest = defineMiddleware((context, next) => {
  // Grab the locale from Astro based on the URL and overwrite the `getLocale`
  // function to use it
  overwriteGetLocale(() => context.currentLocale as Locale)

  return next()
})
