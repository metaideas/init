import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"
import { ENV } from "#shared/env.generated.ts"

export const baseUrl = ENV.BASE_URL

export const allowedOrigins = ENV.ALLOWED_API_ORIGINS

/**
 * A utility function to create Hono apps and middlewares with the correct context type.
 */
export const factory = createFactory<AppContext>()

export function context<T extends AppContext = AppContext>() {
  return getContext<T>()
}
