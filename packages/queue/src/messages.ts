import { logger } from "@init/observability/logger"
import { jsonCodec } from "@init/utils/codec"
import type * as z from "@init/utils/schema"
import { Client, Receiver, type VerifyRequest } from "@upstash/qstash"

type EventsSchema = Record<string, z.core.$ZodType>
type MessageType<Events extends EventsSchema> = keyof Events & string

type MessagePayload<Events extends EventsSchema> = {
  [T in MessageType<Events>]: {
    type: T
    body: z.infer<Events[T]>
  }
}[MessageType<Events>]

type ClientConfig = Pick<
  NonNullable<ConstructorParameters<typeof Client>[0]>,
  "token"
>

type ReceiverConfig = Pick<
  NonNullable<ConstructorParameters<typeof Receiver>[0]>,
  "currentSigningKey" | "nextSigningKey"
>

export function createMessageClient<Events extends EventsSchema>(
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

  async function verify(
    request: Request,
    handler: (payload: MessagePayload<Events>) => Promise<Response>,
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

    const eventSchema = config.events[path as MessageType<Events>]

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

    return handler({ type: path, body: parsed.data })
  }

  return {
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
    verify,
  }
}

export {
  anthropic,
  type Client as QstashClient,
  openai,
  resend,
} from "@upstash/qstash"
