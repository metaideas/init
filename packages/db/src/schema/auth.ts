import {
  boolean,
  index,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import type { Brand } from "@this/utils/type"

import { userRoles } from "./enums"
import { createTable, id, timestamps } from "./helpers"

export const users = createTable(
  "users",
  {
    ...id<"UserId">("usr"),

    role: userRoles().notNull().default("user"),

    name: varchar({ length: 255 }).notNull(),
    image: varchar({ length: 512 }),

    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean().notNull().default(false),

    banned: boolean().notNull().default(false),
    banReason: text(),
    banExpiresAt: timestamp({ mode: "date" }),

    ...timestamps,
  },
  table => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
)
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserId = User["id"]
export type UserRole = User["role"]

export const accounts = createTable(
  "accounts",
  {
    ...id<"AccountId">("acc"),

    userId: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<string, "UserId">>(),

    accountId: varchar({ length: 255 }).notNull(),
    providerId: varchar({ length: 255 }).notNull(),

    accessToken: text(),
    refreshToken: text(),

    accessTokenExpiresAt: timestamp({ mode: "date" }),
    refreshTokenExpiresAt: timestamp({ mode: "date" }),

    scope: varchar({ length: 1024 }),
    idToken: text(),

    password: text(),

    ...timestamps,
  },
  table => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_idx").on(table.providerId),
    uniqueIndex("accounts_provider_account_unique_idx").on(
      table.providerId,
      table.accountId
    ),
  ]
)
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]

export const verifications = createTable(
  "verifications",
  {
    ...id<"VerificationId">("ver"),

    identifier: varchar({ length: 255 }).notNull(),
    value: varchar({ length: 255 }).notNull(),

    expiresAt: timestamp({ mode: "date" }).notNull(),

    ...timestamps,
  },
  table => [
    index("verifications_identifier_idx").on(table.identifier),
    index("verifications_expires_idx").on(table.expiresAt),
    uniqueIndex("verifications_value_unique_idx").on(table.value),
  ]
)
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert
