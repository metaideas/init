import { defineSchema } from "convex/server"
import { tables } from "#functions/components/better-auth/schema.generated.ts"

export default defineSchema({ ...tables, user: tables.user.index("by_email", ["email"]) })
