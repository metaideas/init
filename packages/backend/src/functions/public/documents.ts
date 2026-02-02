import { publicQuery } from "#functions/shared/convex.ts"

export const list = publicQuery({
  handler: async (ctx) => await ctx.db.query("documents").collect(),
})
