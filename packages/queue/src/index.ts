import { APP_ID } from "@this/common/constants"
import { Inngest, slugify } from "inngest"

import { schemas } from "#events.ts"

export { slugify } from "inngest"

export const client = new Inngest({
  id: APP_ID,
  schemas,
})

export const createFunction = client.createFunction

/**
 * This is a helper function to create a function name and id.
 */
export function nameFunction(name: string) {
  return { name, id: slugify(name) }
}
