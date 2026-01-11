import { publicQuery } from "../shared/convex"

export const list = publicQuery({
  handler: async (ctx) => await ctx.db.query("documents").collect(),
})
