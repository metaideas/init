import { timestamp, varchar } from "drizzle-orm/pg-core"

import type { Brand } from "@this/common/types"

import { users } from "./auth"
import { createTable, id, timestamps } from "./helpers"
import { organizations } from "./organizations"

export const sessions = createTable("sessions", {
  ...id<"SessionId">("ses"),

  userId: varchar({ length: 255 })
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "UserId">>(),

  token: varchar({ length: 64 }).notNull().unique(),
  expiresAt: timestamp({ mode: "date" }).notNull(),

  impersonatedBy: varchar({ length: 255 })
    .references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "UserId">>(),

  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 1024 }),

  activeOrganizationId: varchar({ length: 255 })
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "OrganizationId">>(),

  ...timestamps,
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
