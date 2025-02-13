import { Receiver, type VerifyRequest } from "@upstash/qstash"

import env from "@this/env/queue.server"

import { type MessageBody, MessageSchemaMap, type MessageType } from "./events"

const receiver = new Receiver({
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
})

type VerifyMessageRequestResult<T extends MessageType> =
  | {
      success: true
      body: MessageBody<T>
    }
  | {
      success: false
      error: Response
    }

export async function verifyMessageRequest<T extends MessageType>(
  request: Request,
  messageType: T,
  config?: Pick<VerifyRequest, "clockTolerance">
): Promise<VerifyMessageRequestResult<T>> {
  // Validate message type first
  if (!(messageType in MessageSchemaMap)) {
    return {
      success: false,
      error: new Response(`Invalid message type: ${messageType}`, {
        status: 400,
      }),
    }
  }

  const requestClone = request.clone()
  const body = await requestClone.text()

  const signature = request.headers.get("upstash-signature")

  if (!signature || typeof signature !== "string") {
    return {
      success: false,
      error: new Response("Invalid headers", { status: 400 }),
    }
  }

  const isValid = await receiver.verify({
    signature,
    body,
    clockTolerance: config?.clockTolerance,
  })

  if (!isValid) {
    return {
      success: false,
      error: new Response("Invalid signature", { status: 401 }),
    }
  }

  let json: unknown

  try {
    json = JSON.parse(body)
  } catch {
    return {
      success: false,
      error: new Response("Invalid JSON body", { status: 400 }),
    }
  }

  const parsedBody = MessageSchemaMap[messageType].safeParse(json)

  if (!parsedBody.success) {
    return {
      success: false,
      error: new Response("Invalid message structure", { status: 400 }),
    }
  }

  return { success: true, body: parsedBody.data }
}
