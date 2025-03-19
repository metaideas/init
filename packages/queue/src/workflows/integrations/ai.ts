import type { HTTPMethods } from "@upstash/qstash"
import { WorkflowAbort, type WorkflowContext } from "@upstash/workflow"

import { createOpenAI } from "@init/ai/providers"
import { logger } from "@init/observability/logger"

export function createWorkflowOpenAI(context: WorkflowContext) {
  return createOpenAI({
    compatibility: "strict",
    fetch: async (input, init) => {
      try {
        // Prepare headers from init.headers
        const headers = init?.headers
          ? Object.fromEntries(new Headers(init.headers).entries())
          : {}

        // Prepare body from init.body
        const body = init?.body ? JSON.parse(init.body as string) : undefined

        // Make network call
        const response = await context.call("openai-call-step", {
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
      } catch (error) {
        if (error instanceof WorkflowAbort) {
          throw error
        }

        logger.error("Error in fetch implementation:", error)
        throw error // Rethrow error for further handling
      }
    },
  })
}
