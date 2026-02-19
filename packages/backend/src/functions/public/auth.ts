import { authComponent } from "#functions/shared/auth.ts"
import { publicQuery } from "#functions/shared/convex.ts"

export const getCurrentUser = publicQuery
  .handler(async (ctx) => {
    const user = await authComponent.getAuthUser(ctx)

    return user ?? null
  })
  .public()
