import { defineMiddleware } from "astro:middleware"
import { assertIsLocale, baseLocale, setLocale } from "#shared/internationalization/runtime.js"

export const onRequest = defineMiddleware(async (context, next) => {
  await setLocale(assertIsLocale(context.currentLocale ?? baseLocale))

  return next()
})
