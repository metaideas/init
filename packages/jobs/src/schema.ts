import { z } from "@init/utils/schema"

/**
 * Event schemas definition
 *
 * Define your event schemas here using Zod.
 * Each event should have a unique name and a data schema.
 *
 * @example
 * ```ts
 * export const schemas = {
 *   "user/created": {
 *     data: z.object({
 *       userId: z.string(),
 *       email: z.string().email(),
 *     }),
 *   },
 *   "user/updated": {
 *     data: z.object({
 *       userId: z.string(),
 *       changes: z.record(z.unknown()),
 *     }),
 *   },
 * }
 * ```
 */
export const schemas = {
  // Add your event schemas here
  // Example:
  // "user/created": {
  //   data: z.object({
  //     userId: z.string(),
  //     email: z.string().email(),
  //   }),
  // },
}

export default schemas
