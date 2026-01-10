import type { Hono } from "hono"
import { serve as inngestServe } from "inngest/hono"
import { inngest } from "./client"

/**
 * Serve helper for integrating Inngest with Hono
 *
 * @param functions - Array of Inngest functions to serve
 * @returns Hono handler for the Inngest endpoint
 *
 * @example
 * ```ts
 * import { serve } from "@init/jobs"
 * import { myFunction } from "./functions"
 *
 * // In your Hono routes
 * app.route("/queues", serve([myFunction]))
 * ```
 */
export function serve(
  functions: Parameters<typeof inngestServe>[0]["functions"]
): ReturnType<typeof inngestServe> {
  return inngestServe({
    client: inngest,
    functions,
  })
}
