import { publicQuery, vv } from "#functions/shared/convex.ts"

export const list = publicQuery({
  args: { documentId: vv.id("documents") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("messages")
      .withIndex("by_document_id", (q) => q.eq("documentId", args.documentId))
      .collect(),
})
