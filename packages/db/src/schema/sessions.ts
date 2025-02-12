import { integer, text } from "drizzle-orm/sqlite-core"

import type { Brand } from "@this/utils/type"

import { users } from "./auth"
import { constructId, createTable, timestamps } from "./helpers"
import { organizations } from "./organizations"

export const sessions = createTable("sessions", {
  ...constructId<"SessionId">("ses"),

  userId: text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "UserId">>(),

  token: text().notNull().unique(),
  expiresAt: integer({ mode: "timestamp" }).notNull(),

  impersonatedBy: text()
    .references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "UserId">>(),

  ipAddress: text(),
  userAgent: text(),

  activeOrganizationId: text()
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "OrganizationId">>(),

  ...timestamps,
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
