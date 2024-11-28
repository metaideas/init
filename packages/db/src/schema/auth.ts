import type { Brand } from "@this/common/types"

import { createTable, publicId, timestamps } from "#schema/helpers.ts"

export const users = createTable("users", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "UserId">>(),

  role: t
    .text({ enum: ["user", "admin"] })
    .notNull()
    .default("user"),

  name: t.text(),
  image: t.text(),

  email: t.text().notNull().unique(),
  emailVerified: t.integer({ mode: "boolean" }).notNull().default(false),

  banned: t.integer({ mode: "boolean" }).notNull().default(false),
  banReason: t.text(),
  banExpiresAt: t.integer({ mode: "timestamp" }),

  ...timestamps,
  ...publicId<"UserPublicId">("usr"),
}))
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserId = User["id"]
export type UserRole = User["role"]
export type UserPublicId = User["publicId"]

export const accounts = createTable("accounts", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "AccountId">>(),

  userId: t
    .integer()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<number, "UserId">>(),

  accountId: t.text().notNull(),
  providerId: t.text().notNull(),

  accessToken: t.text(),
  refreshToken: t.text(),

  accessTokenExpiresAt: t.integer({ mode: "timestamp" }),
  refreshTokenExpiresAt: t.integer({ mode: "timestamp" }),

  scope: t.text(),
  password: t.text(),

  ...publicId<"AccountPublicId">("acc"),
  ...timestamps,
}))
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]
export type AccountPublicId = Account["publicId"]

export const verifications = createTable("verifications", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "VerificationId">>(),

  identifier: t.text().notNull(),
  value: t.text().notNull(),

  expiresAt: t.integer({ mode: "timestamp" }).notNull(),

  ...timestamps,
}))
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
