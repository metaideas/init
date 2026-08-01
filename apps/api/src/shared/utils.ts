import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"

/**
 * A utility function to create Hono apps and middlewares with the correct context type.
 */
export const factory = createFactory<AppContext>()

export function context<T extends AppContext = AppContext>() {
  return getContext<T>()
}
