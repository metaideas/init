import { logger } from "@init/observability/logger"
import { assertUnreachable } from "@init/utils/assert"
import { createRecursiveProxy } from "@init/utils/proxy"
import type * as z from "@init/utils/schema"
import type { HTTPMethods } from "@upstash/qstash"
import {
  Client,
  type TriggerOptions,
  type WorkflowContext,
} from "@upstash/workflow"
import { serve } from "@upstash/workflow/hono"
import type { Context as HonoContext } from "hono"
import type {
  FlattenedRequestsSchema,
  RequestsSchema,
  RequestType,
  WorkflowClientConfig,
  WorkflowLeaf,
  WorkflowProxy,
} from "./types"
import { flatten } from "./utils"

export class WorkflowClient<TEvent extends RequestsSchema> {
  #client: Client
  #baseUrl: string
  #flattenedEvents: Record<string, z.core.$ZodType>

  constructor(config: WorkflowClientConfig<TEvent>) {
    this.#client = new Client({ token: config.token })
    this.#baseUrl = config.baseUrl
    this.#flattenedEvents = flatten(config.events)
  }

  get events() {
    return createRecursiveProxy((options) => {
      const path = [...options.path]
      const method = path.pop() as keyof WorkflowLeaf<z.core.$ZodType>
      const pathString = path.join(".")
      const url = `${this.#baseUrl}/${pathString}`
      const [body, triggerOptions = {}] = options.args

      if (method === "trigger") {
        return this.#client.trigger({
          ...(triggerOptions as TriggerOptions),
          url,
          body,
        })
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
    }, []) as WorkflowProxy<TEvent>
  }

  handler =
    <
      H extends {
        // biome-ignore lint/suspicious/noExplicitAny: Generic handler
        [K in RequestType<TEvent>]: (c: HonoContext) => any
      },
    >(
      handlers: H
    ) =>
    (c: HonoContext) => {
      const url = new URL(c.req.url)
      const path = url.pathname.split("/").at(-1)

      if (!path) {
        logger.error({ requestUrl: c.req.url }, "Invalid path")

        return new Response(
          `Invalid path. Your message type must be able to be extracted from the URL path. Request URL: ${c.req.url}`,
          { status: 400 }
        )
      }

      const eventType = path as RequestType<TEvent>

      if (!(eventType in this.#flattenedEvents)) {
        logger.error({ path }, "Invalid event type")

        return new Response(`Invalid event type: \`${path}\``, {
          status: 400,
        })
      }

      const handler = handlers[eventType]

      if (!handler) {
        logger.error(
          { eventType: String(eventType) },
          "No handler for event type"
        )

        return new Response(
          `No handler provided for event type: \`${String(eventType)}\``,
          { status: 501 }
        )
      }

      return handler(c)
    }

  serve = <T extends RequestType<TEvent>>(
    _: T,
    fn: Parameters<
      typeof serve<z.infer<FlattenedRequestsSchema<TEvent>[T]>>
    >[0],
    options?: Parameters<
      typeof serve<z.infer<FlattenedRequestsSchema<TEvent>[T]>>
    >[1]
  ) => serve(fn, options)

  /**
   * Provide a fetch implementation with context to an AI provider from the AI
   * SDK.
   *
   * @example
   * ```ts
   * const fetch = workflow.fetch(context)
   * const openai = createOpenAI({ fetch })
   */
  fetch =
    (
      context: WorkflowContext,
      stepName = "ai-call-step"
    ): typeof globalThis.fetch =>
    // @ts-expect-error - Missing "preconnect" property
    async (input, init) => {
      // Prepare headers from init.headers
      const headers = init?.headers
        ? Object.fromEntries(new Headers(init.headers).entries())
        : {}

      // Prepare body from init.body
      const body = init?.body ? JSON.parse(init.body as string) : undefined

      // Make network call
      const response = await context.call(stepName, {
        url: input.toString(),
        method: init?.method as HTTPMethods,
        headers,
        body,
      })

      // Construct headers for the response
      const responseHeaders = new Headers(
        Object.entries(response.header).reduce<Record<string, string>>(
          (acc, [key, values]) => {
            acc[key] = values.join(", ")
            return acc
          },
          {}
        )
      )

      // Return the constructed response
      return new Response(JSON.stringify(response.body), {
        status: response.status,
        headers: responseHeaders,
      })
    }

  get client() {
    return this.#client
  }
}

export { Client } from "@upstash/workflow"
