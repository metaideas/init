import { logger } from "@init/observability/logger"
import { assertUnreachable } from "@init/utils/assert"
import { jsonCodec } from "@init/utils/codec"
import { createRecursiveProxy } from "@init/utils/proxy"
import type * as z from "@init/utils/schema"
import {
  anthropic,
  custom,
  openai,
  Client as QstashClient,
  Receiver as QstashReceiver,
  resend,
  type VerifyRequest,
} from "@upstash/qstash"
import type { Context as HonoContext } from "hono"
import type {
  FlattenedRequestsSchema,
  MessageClientConfig,
  MessageLeaf,
  MessageProxy,
  RequestsSchema,
  RequestType,
} from "./types"
import { flatten } from "./utils"

export class MessageClient<TRequest extends RequestsSchema> {
  #client: QstashClient
  #receiver: QstashReceiver
  #baseUrl: string
  #flattenedEvents: Record<string, z.core.$ZodType>

  constructor(config: MessageClientConfig<TRequest>) {
    this.#client = new QstashClient({ token: config.token })
    this.#receiver = new QstashReceiver({
      currentSigningKey: config.currentSigningKey,
      nextSigningKey: config.nextSigningKey,
    })
    this.#baseUrl = config.baseUrl
    this.#flattenedEvents = flatten(config.events)
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
    return createRecursiveProxy((options) => {
      const path = [...options.path]
      const method = path.pop() as keyof MessageLeaf<z.core.$ZodType>
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
    }, []) as MessageProxy<TRequest>
  }

  /**
   * The handler for the messages.
   *
   * This function is used to handle the messages from the Upstash Qstash.
   * It verifies the signature of the request and then parses the body of the request.
   * It then calls the handler function for the message type.
   * It returns a response with the result of the handler function.
   */
  handler =
    <
      H extends {
        [K in RequestType<TRequest>]: (
          body: z.infer<FlattenedRequestsSchema<TRequest>[K]>
        ) => unknown
      },
    >(
      handlers: H,
      options?: Pick<VerifyRequest, "clockTolerance">
    ) =>
    async (c: HonoContext) => {
      const signature = c.req.header("upstash-signature")

      if (!signature) {
        return new Response("`Upstash-Signature` header is missing", {
          status: 400,
        })
      }

      if (typeof signature !== "string") {
        logger.with({ requestUrl: c.req.url }).error("`Upstash-Signature` header is not a string")

        throw new TypeError("`Upstash-Signature` header is not a string")
      }

      const body = await c.req.text()

      const isValid = await this.#receiver.verify({
        signature,
        body,
        clockTolerance: options?.clockTolerance,
      })

      if (!isValid) {
        logger.with({ requestUrl: c.req.url }).error("Invalid signature")

        return new Response("Invalid signature", {
          status: 403,
        })
      }

      const url = new URL(c.req.url)
      const path = url.pathname.split("/").at(-1)

      if (!path) {
        logger.with({ requestUrl: c.req.url }).error("Invalid path")

        return new Response(
          `Invalid path. Your message type must be able to be extracted from the URL path. Request URL: ${c.req.url}`,
          { status: 400 }
        )
      }

      const messageType = path as RequestType<TRequest>

      if (!(messageType in this.#flattenedEvents)) {
        logger.with({ path }).error("Invalid message type")

        return new Response(`Invalid message type: \`${path}\``, {
          status: 400,
        })
      }

      const eventSchema =
        this.#flattenedEvents[messageType as keyof Record<string, z.core.$ZodType>]

      if (!eventSchema) {
        logger.with({ path }).error("Invalid message type")

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

      const handler = handlers[messageType]

      if (!handler) {
        logger.with({ messageType: String(messageType) }).error("No handler for message type")

        return new Response(`No handler provided for message type: \`${String(messageType)}\``, {
          status: 501,
        })
      }

      // TypeScript can't narrow messageType to a literal type, so we use a type assertion.
      // The runtime validation above ensures messageType is valid and parsed.data matches the schema.
      // biome-ignore lint/suspicious/noExplicitAny: Runtime validation ensures type safety
      const result = await handler(parsed.data as any)

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

  get integrations() {
    return {
      ai: {
        openai,
        anthropic,
        custom,
      },
      resend,
    }
  }
}

export { Client, Receiver } from "@upstash/qstash"
