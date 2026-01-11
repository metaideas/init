import type { UserWithRole } from "@init/auth/server/plugins"
import { convexAuth } from "#functions/shared/auth/index.ts"
import { authComponent } from "#functions/shared/auth/options.ts"
import { privateQuery } from "#functions/shared/convex.ts"

export const list = privateQuery({
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(convexAuth, ctx)

    const result = await auth.api.listUsers({ headers, query: { limit: 100 } })

    return result.users as UserWithRole[]
  },
})
