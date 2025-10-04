import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  documents: defineTable({
    name: v.string(),
    content: v.string(),
  }).index("by_name", ["name"]),
  messages: defineTable({
    content: v.string(),
    documentId: v.id("documents"),
  }).index("by_document_id", ["documentId"]),
})
