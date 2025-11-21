import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"

/**
 * A utility function that allows us to create Hono apps and middlewares with
 * the correct context type.
 */
export const factory = createFactory<AppContext>()

export const context = getContext<AppContext>
