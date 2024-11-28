import type { Brand } from "@this/common/types"

import { users } from "#schema/auth.ts"
import { createTable, timestamps } from "#schema/helpers.ts"
import { organizations } from "#schema/organizations.ts"

export const sessions = createTable("sessions", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "SessionId">>(),

  userId: t
    .integer()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<number, "UserId">>(),

  token: t.text().notNull().unique(),
  expiresAt: t.integer({ mode: "timestamp" }).notNull(),

  impersonatedBy: t
    .integer()
    .references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<number, "UserId">>(),

  ipAddress: t.text(),
  userAgent: t.text(),

  activeOrganizationId: t
    .integer()
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<number, "OrganizationId">>(),

  ...timestamps,
}))
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
