import type { HTTPMethods } from "@upstash/qstash"
import type { WorkflowContext } from "@upstash/workflow"

/**
 * Provide a fetch implementation with context to an AI provider from the AI
 * SDK.
 *
 * @example
 * ```ts
 * const fetch = contextFetch(context, "ai")
 * const openai = createOpenAI({ fetch })
 */
export function contextFetch(
  context: WorkflowContext,
  /**
   * The name of the step to register in the workflow.
   */
  stepName = "ai-call-step"
): typeof globalThis.fetch {
  // @ts-expect-error - Missing "preconnect" property
  return async (input, init) => {
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
}
