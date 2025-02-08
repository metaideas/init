import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

import type { Session } from "@this/auth/server"
import type { DeepMerge } from "@this/common/types"

import type { AppContext } from "~/lib/types"

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
