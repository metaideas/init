import type { Brand } from "@this/common/types"
import { bigint, timestamp, varchar } from "drizzle-orm/pg-core"
import { users } from "#schema/auth.ts"
import { createTable, publicId, timestamps } from "#schema/helpers.ts"
import { organizations } from "#schema/organizations.ts"

export const sessions = createTable("sessions", {
  id: bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "SessionId">>(),

  userId: bigint({ mode: "bigint" })
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<bigint, "UserId">>(),

  token: varchar({ length: 64 }).notNull().unique(),
  expiresAt: timestamp({ mode: "date" }).notNull(),

  impersonatedBy: bigint({ mode: "bigint" })
    .references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<bigint, "UserId">>(),

  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 1024 }),

  activeOrganizationId: bigint({ mode: "bigint" })
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<bigint, "OrganizationId">>(),

  ...timestamps,
  ...publicId<"PublicSessionId">("ses"),
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
