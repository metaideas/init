import { findIp } from "@init/security/tools"
import { type Duration, duration } from "@init/utils/duration"
import type { DeepMerge } from "@init/utils/type"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { rateLimiter } from "hono-rate-limiter"
import type { Session } from "~/shared/auth"
import type { AppContext } from "~/shared/types"

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
export const withRateLimiting = (interval: Duration, limit: number) =>
  rateLimiter<AppContext>({
    windowMs: duration(interval),
    limit,
    standardHeaders: "draft-7",
    keyGenerator: (c) =>
      c.var.session?.user.id ?? findIp(c.req.raw) ?? "unknown",
  })
