import type { GenericCtx } from "@convex-dev/better-auth"
import { createAuth } from "@init/auth/server"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { createAuthOptions } from "#functions/shared/auth.ts"

// Static instance for Better Auth schema generation only
// SAFETY: Better Auth reads this context only when a database operation runs; schema generation does not run database operations.
const schemaGenerationContext = {} as GenericCtx<DataModel>

export const auth = createAuth({
  ...createAuthOptions(schemaGenerationContext),
})
