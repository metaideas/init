import { logger } from "@init/observability/logger"
import { jsonCodec } from "@init/utils/codec"
import type * as z from "@init/utils/schema"
import { Client, Receiver, type VerifyRequest } from "@upstash/qstash"

type EventsSchema = Record<string, z.core.$ZodType>
type MessageType<Events extends EventsSchema> = keyof Events & string

type ClientConfig = Pick<
  NonNullable<ConstructorParameters<typeof Client>[0]>,
  "token"
>

type ReceiverConfig = Pick<
  NonNullable<ConstructorParameters<typeof Receiver>[0]>,
  "currentSigningKey" | "nextSigningKey"
>

export function buildMessageClient<Events extends EventsSchema>(
  config: ClientConfig &
    ReceiverConfig & {
      /**
       * The base URL of your API.
       */
      baseUrl: string
      /**
       * The events schema of your API.
       */
      events: Events
    }
) {
  const client = new Client({ token: config.token })

  const receiver = new Receiver({
    currentSigningKey: config.currentSigningKey,
    nextSigningKey: config.nextSigningKey,
  })

  async function handler<
    H extends {
      [T in MessageType<Events>]: (
        body: z.infer<Events[T]>
      ) => Promise<Response> | Response
    },
  >(
    request: Request,
    handlers: H,
    options?: Pick<VerifyRequest, "clockTolerance">
  ): Promise<Response> {
    const signature = request.headers.get("upstash-signature")

    if (!signature) {
      return new Response("`Upstash-Signature` header is missing", {
        status: 400,
      })
    }

    if (typeof signature !== "string") {
      logger.error(
        { requestUrl: request.url },
        "`Upstash-Signature` header is not a string"
      )

      throw new TypeError("`Upstash-Signature` header is not a string")
    }

    const body = await request.clone().text()

    const isValid = await receiver.verify({
      signature,
      body,
      clockTolerance: options?.clockTolerance,
    })

    if (!isValid) {
      logger.error({ requestUrl: request.url }, "Invalid signature")

      return new Response("Invalid signature", {
        status: 403,
      })
    }

    const url = new URL(request.url)
    const path = url.pathname.split("/").at(-1)

    if (!path) {
      logger.error({ requestUrl: request.url }, "Invalid path")

      return new Response(
        `Invalid path. Your message type must be able to be extracted from the URL path. Request URL: ${request.url}`,
        { status: 400 }
      )
    }

    const messageType = path as MessageType<Events>
    const eventSchema = config.events[messageType]

    if (!eventSchema) {
      logger.error({ path }, "Invalid message type")

      return new Response(`Invalid message type: \`${path}\``, {
        status: 400,
      })
    }

    const parsed = jsonCodec(eventSchema).safeDecode(body)

    if (!parsed.success) {
      return new Response("Invalid message structure", {
        status: 400,
      })
    }

    const handlerFn = handlers[messageType]

    if (!handlerFn) {
      logger.error({ messageType }, "No handler for message type")
      return new Response(
        `No handler provided for message type: \`${messageType}\``,
        { status: 501 }
      )
    }

    await handlerFn(parsed.data)

    return new Response("Message processed", { status: 200 })
  }

  return {
    client,
    publish: client.publishJSON.bind(client),
    batch: client.batchJSON.bind(client),
    /**
     * Create a payload for the given event type.
     */
    payload: (
      type: MessageType<Events>,
      body: z.infer<Events[MessageType<Events>]>
    ) => ({
      url: `${config.baseUrl}/${type}`,
      body,
    }),
    handler,
  }
}

export {
  anthropic,
  type Client as QstashClient,
  openai,
  resend,
} from "@upstash/qstash"

// Re-export nested events functionality
export { defineEvents, flattenEvents, createMessages, toFlatMap } from "./events"

