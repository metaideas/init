/**
 * Example Inngest Function
 *
 * This file demonstrates how to create an Inngest function.
 * Uncomment and modify this code to create your own functions.
 *
 * @example
 * ```ts
 * import { inngest } from "@init/jobs/client"
 *
 * export const exampleFunction = inngest.createFunction(
 *   { id: "example-function" },
 *   { event: "app/example" },
 *   async ({ event, step }) => {
 *     const result = await step.run("process-data", async () => {
 *       // Your processing logic here
 *       return { processed: true }
 *     })
 *
 *     return result
 *   }
 * )
 * ```
 */

// import { inngest } from "@init/jobs/client"

// export const exampleFunction = inngest.createFunction(
//   { id: "example-function" },
//   { event: "app/example" },
//   async ({ event, step }) => {
//     // Your function logic here
//     return { success: true }
//   }
// )
