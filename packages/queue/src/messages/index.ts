import { logger } from "@init/observability/logger"
import { assertUnreachable } from "@init/utils/assert"
import { jsonCodec } from "@init/utils/codec"
import * as z from "@init/utils/schema"
import {
  anthropic,
  openai,
  Client as QstashClient,
  Receiver as QstashReceiver,
  resend,
  type VerifyRequest,
} from "@upstash/qstash"
import type {
  ClientConfig,
  EventsSchema,
  FlattenedEventsSchema,
  MessageProxy,
  MessageType,
  ProxyCallback,
  ReceiverConfig,
} from "./types"

export class MessageClient<TEvents extends EventsSchema> {
  #client: QstashClient
  #receiver: QstashReceiver
  #baseUrl: string
  #flattenedEvents: Record<string, z.core.$ZodType>

  constructor(
    config: ClientConfig & ReceiverConfig & { baseUrl: string; events: TEvents }
  ) {
    this.#client = new QstashClient({ token: config.token })
    this.#receiver = new QstashReceiver({
      currentSigningKey: config.currentSigningKey,
      nextSigningKey: config.nextSigningKey,
    })
    this.#baseUrl = config.baseUrl
    this.#flattenedEvents = this.#flattenEvents(config.events)
  }

  #flattenEvents = (
    events: EventsSchema,
    prefix = ""
  ): Record<string, z.core.$ZodType> => {
    const result: Record<string, z.core.$ZodType> = {}

    for (const [key, value] of Object.entries(events)) {
      const path = prefix ? `${prefix}.${key}` : key

      if (value instanceof z.core.$ZodType) {
        result[path] = value
      } else if (typeof value === "object" && value !== null) {
        Object.assign(result, this.#flattenEvents(value as EventsSchema, path))
      }
    }

    return result
  }

  #createRecursiveProxy(callback: ProxyCallback, path: readonly string[]) {
    const proxy: unknown = new Proxy(
      () => {
        // dummy no-op function since we don't have any client-side target we want
        // to remap to
      },
      {
        get: (_obj, key) => {
          if (typeof key !== "string") {
            return
          }

          return this.#createRecursiveProxy(callback, [...path, key])
        },
        apply: (_1, _2, args) => callback({ path, args }),
      }
    )

    return proxy
  }

  /**
   * The messages proxy for the events schema.
   *
   * This object provides strongly-typed helpers for each event defined in your schema. Each leaf exposes:
   *   - `.publish(body)`: Publishes a message of this type with the correct payload shape, inferred from your schema.
   *   - `$path`: The unique path (string) identifying this message type (e.g. "stripe.payment.updated").
   *   - `$schema`: The Zod schema for this message type.
   *   - `options(body)`: Helper that returns the URL and body payload for publishing (internal use).
   *
   * You can access nested events intuitively:
   *
   * @example
   * ```ts
   * // Suppose your events schema looks like:
   * const events = {
   *   stripe: {
   *     checkout: {
   *       created: z.object({ id: z.string() })
   *     }
   *   }
   * }
   *
   * const { messages } = buildMessageClient({ ... })
   *
   * // Type-safe usage
   * const result = await messages.stripe.checkout.created.publish({ id: "evt_123" })
   *
   * // You have access to the underlying path and schema:
   * const path = messages.stripe.checkout.created.$path // "stripe.checkout.created"
   * const schema = messages.stripe.checkout.created.$schema
   * ```
   */
  get events() {
    return this.#createRecursiveProxy((options) => {
      const path = [...options.path]
      const method = path.pop() as "publish" | "options" | "$path" | "$schema"
      const pathString = path.join(".")
      const url = `${this.#baseUrl}/${pathString}`
      const [body] = options.args

      if (method === "publish") {
        return this.#client.publishJSON({ url, body })
      }

      if (method === "options") {
        return { url, body }
      }

      if (method === "$path") {
        return pathString
      }

      if (method === "$schema") {
        return this.#flattenedEvents[pathString]
      }

      assertUnreachable(method)
    }, []) as MessageProxy<TEvents>
  }

  /**
   * The handler for the messages.
   *
   * This function is used to handle the messages from the Upstash Qstash.
   * It verifies the signature of the request and then parses the body of the request.
   * It then calls the handler function for the message type.
   * It returns a response with the result of the handler function.
   */
  handler = async <
    H extends {
      [K in MessageType<TEvents>]: (
        body: z.infer<FlattenedEventsSchema<TEvents>[K]>
      ) => unknown
    },
  >(
    request: Request,
    handlers: H,
    options?: Pick<VerifyRequest, "clockTolerance">
  ): Promise<Response> => {
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

    const isValid = await this.#receiver.verify({
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

    const messageType = path as MessageType<TEvents>

    if (!(messageType in this.#flattenedEvents)) {
      logger.error({ path }, "Invalid message type")

      return new Response(`Invalid message type: \`${path}\``, {
        status: 400,
      })
    }

    const eventSchema =
      this.#flattenedEvents[
        messageType as keyof Record<string, z.core.$ZodType>
      ]

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

    const startTime = Date.now()

    const handlerFn = handlers[messageType]

    if (!handlerFn) {
      logger.error(
        { messageType: String(messageType) },
        "No handler for message type"
      )

      return new Response(
        `No handler provided for message type: \`${String(messageType)}\``,
        { status: 501 }
      )
    }

    // TypeScript can't narrow messageType to a literal type, so we use a type assertion.
    // The runtime validation above ensures messageType is valid and parsed.data matches the schema.
    // biome-ignore lint/suspicious/noExplicitAny: Runtime validation ensures type safety
    const result = await handlerFn(parsed.data as any)

    return new Response(
      JSON.stringify({
        message: "Message processed successfully",
        completedAt: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
        result,
      }),
      { status: 200 }
    )
  }

  get client() {
    return this.#client
  }

  get receiver() {
    return this.#receiver
  }

  get integration() {
    return {
      anthropic,
      openai,
      resend,
    }
  }
}

export { Client, Receiver } from "@upstash/qstash"
