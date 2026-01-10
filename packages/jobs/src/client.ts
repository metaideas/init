import { Inngest } from "inngest"
import type { schemas } from "./schema"

/**
 * Events type - inferred from the event schemas
 */
export type Events = typeof schemas

/**
 * Inngest client instance
 *
 * This client is used to create functions and send events.
 *
 * @example
 * ```ts
 * import { inngest } from "@init/jobs/client"
 *
 * // Send an event
 * await inngest.send({
 *   name: "user/created",
 *   data: {
 *     userId: "123",
 *     email: "user@example.com",
 *   },
 * })
 *
 * // Create a function
 * export const myFunction = inngest.createFunction(
 *   { id: "my-function" },
 *   { event: "user/created" },
 *   async ({ event, step }) => {
 *     // Function logic
 *   }
 * )
 * ```
 */
export const inngest = new Inngest({
  id: "init",
  schemas,
})
