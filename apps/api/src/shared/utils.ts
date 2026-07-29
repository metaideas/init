import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"

/**
 * A utility function to create Hono apps and middlewares with the correct context type.
 */
export const factory = createFactory<AppContext>()
