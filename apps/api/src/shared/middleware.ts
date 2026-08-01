import { findIp } from "@arcjet/ip"
import { rateLimiter } from "hono-rate-limiter"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { languageDetector } from "hono/language"
import { type TimeExpression, ms } from "qte"
import type { AppContext, AuthenticatedAppContext } from "#shared/types.ts"
import { baseLocale, locales } from "#shared/internationalization/runtime.js"

export const withLanguageDetection = languageDetector({
  caches: false,
  fallbackLanguage: baseLocale,
  order: ["header"],
  supportedLanguages: [...locales],
})

export const requireSession = createMiddleware<AuthenticatedAppContext>(async (c, next) => {
  const session = await c.var.auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  c.set("session", session)

  await next()
})

/**
 * Adds basic rate limiting protection with a fixed window to the request.
 */
export function withRateLimiting(interval: TimeExpression, limit: number) {
  return rateLimiter<AppContext>({
    keyGenerator: (c) => findIp(c.req.raw),
    limit,
    standardHeaders: "draft-7",
    windowMs: ms(interval),
  })
}
