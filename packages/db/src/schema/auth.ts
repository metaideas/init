import { DEFAULT_LOCALE } from "@this/common/constants"
import { LOCALES } from "@this/common/constants"
import type { Brand } from "@this/common/types"

import { createPublicId, createTable, timestamps } from "#schema/helpers.ts"

export const users = createTable("users", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "UserId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("usr"))
    .$type<Brand<string, "PublicUserId">>(),

  role: t
    .text({ enum: ["user", "admin"] })
    .notNull()
    .default("user"),

  email: t.text().notNull().unique(),
  emailVerifiedAt: t.integer({ mode: "timestamp" }),

  // OAuth accounts
  googleId: t.text().unique(),
  githubId: t.text().unique(),

  ...timestamps,
}))
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserId = User["id"]
export type UserRole = User["role"]

export const passwords = createTable("passwords", t => ({
  userId: t
    .integer()
    .unique()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<number, "UserId">>(),
  hashString: t.text().notNull(),

  ...timestamps,
}))

export type Password = typeof passwords.$inferSelect
export type NewPassword = typeof passwords.$inferInsert

export const profiles = createTable("profiles", t => ({
  userId: t
    .integer()
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
    .$type<Brand<number, "UserId">>(),

  name: t.text(),
  avatarUrl: t.text(),
  phoneNumber: t.text(),
  preferredLocale: t.text({ enum: LOCALES }).default(DEFAULT_LOCALE),

  ...timestamps,
}))
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
