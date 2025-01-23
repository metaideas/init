import {
  bigint,
  boolean,
  index,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import type { Brand } from "@this/common/types"
import { userRoles } from "#schema/enums.ts"
import { createTable, publicId, timestamps } from "#schema/helpers.ts"

export const users = createTable(
  "users",
  {
    id: bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "UserId">>(),

    role: userRoles().notNull().default("user"),

    name: varchar({ length: 255 }).notNull(),
    image: varchar({ length: 512 }),

    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean().notNull().default(false),

    banned: boolean().notNull().default(false),
    banReason: text(),
    banExpiresAt: timestamp({ mode: "date" }),

    ...timestamps,
    ...publicId<"UserPublicId">("usr"),
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
export type UserPublicId = User["publicId"]

export const accounts = createTable(
  "accounts",
  {
    id: bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "AccountId">>(),

    userId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "UserId">>(),

    accountId: varchar({ length: 255 }).notNull(),
    providerId: varchar({ length: 255 }).notNull(),

    accessToken: text(),
    refreshToken: text(),

    accessTokenExpiresAt: timestamp({ mode: "date" }),
    refreshTokenExpiresAt: timestamp({ mode: "date" }),

    scope: varchar({ length: 1024 }),
    password: text(),

    ...publicId<"AccountPublicId">("acc"),
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
export type AccountPublicId = Account["publicId"]

export const verifications = createTable(
  "verifications",
  {
    id: bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "VerificationId">>(),

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
