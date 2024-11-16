import { pgSchema } from "drizzle-orm/pg-core"

export const authSchema = pgSchema("auth")

export const users = authSchema.table("users", t => ({
  id: t.uuid("id").primaryKey(),
}))
