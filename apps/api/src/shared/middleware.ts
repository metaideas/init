import type { DeepMerge } from "@init/utils/type"
import { kv } from "@init/kv/client"
import { findIp } from "@init/security/tools"
import { type Duration, toMilliseconds } from "@init/utils/duration"
import { rateLimiter } from "hono-rate-limiter"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { Session } from "#shared/auth.ts"
import type { AppContext } from "#shared/types.ts"

export const requireSession = createMiddleware<
  DeepMerge<AppContext, { Variables: { session: Session } }>
>(async (c, next) => {
  if (c.var.session) {
    await next()
    return
  }

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
export function withRateLimiting(interval: Duration, limit: number) {
  return rateLimiter<AppContext>({
    keyGenerator: (c) => c.var.session?.user.id ?? findIp(c.req.raw) ?? "unknown",
    limit,
    standardHeaders: "draft-7",
    windowMs: toMilliseconds(interval),
  })
}

export function withNamespacedKV(namespace: string) {
  return createMiddleware<AppContext>(async (c, next) => {
    c.set("kv", kv(namespace))

    await next()
  })
}
