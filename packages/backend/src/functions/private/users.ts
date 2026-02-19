import type { UserWithRole } from "@init/auth/server/plugins"
import { authComponent, convexAuth } from "#functions/auth.ts"
import { privateQuery } from "#functions/shared/convex.ts"

export const list = privateQuery
  .handler(async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(convexAuth, ctx)
    const result = await auth.api.listUsers({ headers, query: { limit: 100 } })

    return result.users as UserWithRole[]
  })
  .public()
