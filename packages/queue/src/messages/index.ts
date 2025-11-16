import { logger } from "@init/observability/logger"
import { assertUnreachable } from "@init/utils/assert"
import { jsonCodec } from "@init/utils/codec"
import * as z from "@init/utils/schema"
import { Client, Receiver, type VerifyRequest } from "@upstash/qstash"
import type {
  ClientConfig,
  EventsSchema,
  FlattenedEventsSchema,
  MessageProxy,
  MessageType,
  ProxyCallback,
  ReceiverConfig,
} from "./types"

function flattenEvents(
  events: EventsSchema,
  prefix = ""
): Record<string, z.core.$ZodType> {
  const result: Record<string, z.core.$ZodType> = {}

  for (const [key, value] of Object.entries(events)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (value instanceof z.core.$ZodType) {
      result[path] = value
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenEvents(value as EventsSchema, path))
    }
  }

  return result
}

function createRecursiveProxy(
  callback: ProxyCallback,
  path: readonly string[]
) {
  const proxy: unknown = new Proxy(
    () => {
      // dummy no-op function since we don't have any client-side target we want
      // to remap to
    },
    {
      get(_obj, key) {
        if (typeof key !== "string") {
          return
        }

        return createRecursiveProxy(callback, [...path, key])
      },
      apply(_1, _2, args) {
        return callback({ path, args })
      },
    }
  )

  return proxy
}

export function buildMessageClient<TEvents extends EventsSchema>(
  config: ClientConfig &
    ReceiverConfig & {
      /**
       * The base URL of your API.
       */
      baseUrl: string
      /**
       * The events schema of your API.
       */
      events: TEvents
    }
) {
  const client = new Client({ token: config.token })

  const receiver = new Receiver({
    currentSigningKey: config.currentSigningKey,
    nextSigningKey: config.nextSigningKey,
  })

  const flattenedEvents = flattenEvents(config.events)

  function createMessageProxy() {
    return createRecursiveProxy((options) => {
      const path = [...options.path]
      const method = path.pop() as "publish" | "options" | "$path" | "$schema"
      const pathString = path.join(".")
      const url = `${config.baseUrl}/${pathString}`
      const [body] = options.args

      if (method === "publish") {
        return client.publishJSON({ url, body })
      }

      if (method === "options") {
        return { url, body }
      }

      if (method === "$path") {
        return pathString
      }

      if (method === "$schema") {
        return flattenedEvents[pathString]
      }

      assertUnreachable(method)
    }, []) as MessageProxy<TEvents>
  }

  async function handler<
    H extends {
      [K in MessageType<TEvents>]: (
        body: z.infer<FlattenedEventsSchema<TEvents>[K]>
      ) => unknown
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

    const messageType = path as MessageType<TEvents>

    if (!(messageType in flattenedEvents)) {
      logger.error({ path }, "Invalid message type")

      return new Response(`Invalid message type: \`${path}\``, {
        status: 400,
      })
    }

    const eventSchema =
      flattenedEvents[messageType as keyof typeof flattenedEvents]

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

  return {
    client,
    receiver,
    /**
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
    messages: createMessageProxy(),
    publishMessage: client.publishJSON.bind(client),
    batchMessages: client.batchJSON.bind(client),
    handler,
  }
}

export {
  anthropic,
  type Client as QstashClient,
  openai,
  resend,
} from "@upstash/qstash"
