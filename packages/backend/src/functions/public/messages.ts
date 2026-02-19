import { v } from "convex/values"
import { publicQuery } from "#functions/shared/convex.ts"

export const list = publicQuery
  .input({ documentId: v.id("documents") })
  .handler(
    async (ctx, args) =>
      await ctx.db
        .query("messages")
        .withIndex("by_document_id", (q) => q.eq("documentId", args.documentId))
        .collect()
  )
  .public()
