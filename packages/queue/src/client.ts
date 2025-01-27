import { APP_ID } from "@this/common/constants"
import { logger } from "@this/observability/logger"
import { Inngest, slugify } from "inngest"

import { schemas } from "#events.ts"

export const queue = new Inngest({
  id: APP_ID,
  schemas,
  logger,
})

/**
 * Create a function object with a name and ID
 */
export function nameFunction(name: string) {
  return { name, id: createId(name) }
}

/**
 * Create an ID for a function based on it's name
 */
export function createId(name: string) {
  return slugify(name)
}
