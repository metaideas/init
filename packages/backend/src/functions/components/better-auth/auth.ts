import type { GenericCtx } from "@convex-dev/better-auth"
import { createAuth } from "@init/auth/server"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { createAuthOptions } from "#functions/shared/auth.ts"

// Static instance for Better Auth schema generation only
export const auth = createAuth({
  ...createAuthOptions({} as GenericCtx<DataModel>),
})
