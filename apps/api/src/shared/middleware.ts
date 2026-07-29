import type { DeepMerge } from "@init/utils/type"
import type { Context } from "hono"
import { findIp } from "@arcjet/ip"
import { rateLimiter } from "hono-rate-limiter"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { type TimeExpression, ms } from "qte"
import type { Session } from "#shared/auth.ts"
import type { AppContext } from "#shared/types.ts"

type ProtectedAppContext = DeepMerge<AppContext, { Variables: { session: Session } }>
type SessionResolver = (context: Context<ProtectedAppContext>) => Promise<Session | null>

export function createRequireSession(
  resolveSession: SessionResolver = (context) =>
    context.var.auth.api.getSession({
      headers: context.req.raw.headers,
    })
) {
  return createMiddleware<ProtectedAppContext>(async (context, next) => {
    const session = await resolveSession(context)

    if (!session) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    context.set("session", session)

    await next()
  })
}

export const requireSession = createRequireSession()

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
