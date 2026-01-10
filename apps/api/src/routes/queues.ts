import { serve } from "@init/jobs"

/**
 * Inngest functions handler route
 *
 * This route serves Inngest functions for background job processing.
 * Functions should be defined separately and imported here.
 *
 * @example
 * ```ts
 * import { myFunction } from "./functions/my-function"
 *
 * export default serve([myFunction])
 * ```
 */
export default serve([
  // Add your Inngest functions here
  // Example: userCreatedFunction
])
