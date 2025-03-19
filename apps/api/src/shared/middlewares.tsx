import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"

import type { MessageBody, MessageType } from "@init/queue/messages"
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
