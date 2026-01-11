import type { GenericCtx } from "@convex-dev/better-auth"
import { createAuth } from "@init/auth/server"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { authOptions } from "#functions/shared/auth/options.ts"

// Export a static instance for Better Auth schema generation
export const auth = createAuth({
  ...authOptions({} as GenericCtx<DataModel>),
})
