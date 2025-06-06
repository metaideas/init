import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import type { MessageBody, MessageType } from "@init/queue/messages"
import { createRateLimiter } from "@init/security/ratelimit"
import type { DeepMerge } from "@init/utils/type"

import type { Session } from "~/shared/auth"
import type { AppContext } from "~/shared/types"

export const requireSession = createMiddleware<
  DeepMerge<AppContext, { Variables: { session: Session } }>
>(async (c, next) => {
  const session = await c.var.auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  c.set("session", session)

  await next()
})

export function verifyMessage<T extends MessageType>(type: T) {
  return createMiddleware<
    DeepMerge<AppContext, { Variables: { message: MessageBody<T> } }>
  >(async (c, next) => {
    const { verifyMessageRequest } = await import("@init/queue/messages/verify")

    const message = await verifyMessageRequest(c.req.raw, type)

    if (!message.success) {
      throw new HTTPException(message.error.status as ContentfulStatusCode, {
        res: message.error,
      })
    }

    c.set("message", message.body)

    await next()
  })
}

export function rateLimitByIp(
  name: string,
  limiter: Parameters<typeof createRateLimiter>[1]["limiter"]
) {
  const rateLimiter = createRateLimiter(name, { limiter })

  return createMiddleware<AppContext>(async (c, next) => {
    const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For") ??
      c.req.header("X-Real-IP") ??
      "anonymous"

    const { success, limit, remaining, reset } = await rateLimiter.limit(ip)

    c.res.headers.set("X-RateLimit-Limit", limit.toString())
    c.res.headers.set("X-RateLimit-Remaining", remaining.toString())
    c.res.headers.set("X-RateLimit-Reset", reset.toString())

    if (!success) {
      throw new HTTPException(429, {
        message: "Too many requests",
        cause: { limit, remaining, reset },
      })
    }

    await next()
  })
}
