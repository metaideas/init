import { ACCOUNT_ROLES, DEFAULT_LOCALE, LOCALES } from "@this/common/constants"
import type { Brand } from "@this/common/types"
import { pgEnum, primaryKey, unique } from "drizzle-orm/pg-core"

import { users } from "#schema/auth.ts"
import { createPublicId, createTable } from "#schema/helpers.ts"

export const accountRole = pgEnum("account_role", ACCOUNT_ROLES)
export const locale = pgEnum("locale", LOCALES)

export const profiles = createTable(
  "profiles",
  table => ({
    updatedAt: table
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),
    createdAt: table.timestamp({ mode: "date" }).defaultNow().notNull(),

    userId: table
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),

    name: table.text(),
    avatarUrl: table.text(),
    phoneNumber: table.text(),
    preferredLocale: locale().notNull().default(DEFAULT_LOCALE),
  }),
  table => [primaryKey({ columns: [table.userId] })]
)
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export const organizations = createTable("organizations", table => ({
  id: table
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "OrganizationId">>(),
  publicId: table
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("org"))
    .$type<Brand<string, "OrganizationPublicId">>(),
  createdAt: table.timestamp({ mode: "date" }).defaultNow().notNull(),
  updatedAt: table
    .timestamp({ mode: "date" })
    .$onUpdateFn(() => new Date())
    .defaultNow()
    .notNull(),

  name: table.text().notNull(),
}))
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]
export type OrganizationPublicId = Organization["publicId"]

export const accounts = createTable(
  "accounts",
  table => ({
    id: table
      .bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "AccountId">>(),
    publicId: table
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("acc"))
      .$type<Brand<string, "AccountPublicId">>(),
    createdAt: table.timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: table
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),

    userId: table
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<Brand<bigint, "UserId">>(),
    organizationId: table
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),

    role: accountRole().notNull().default("member"),
  }),
  table => [
    unique("user_organization_unique").on(table.userId, table.organizationId),
  ]
)
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]
export type AccountPublicId = Account["publicId"]

export const organizationInvitations = createTable(
  "organization_invitations",
  table => ({
    id: table
      .bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "OrganizationInvitationId">>(),
    publicId: table
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("org_invite"))
      .$type<Brand<string, "OrganizationInvitationPublicId">>(),
    createdAt: table.timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: table
      .timestamp({ mode: "date" })
      .$onUpdateFn(() => new Date())
      .defaultNow()
      .notNull(),

    organizationId: table
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),
    inviterId: table
      .bigint({ mode: "bigint" })
      .notNull()
      .references(() => accounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "AccountId">>(),

    email: table.text().notNull(),
    role: accountRole().notNull().default("member"),
    token: table.text().notNull().unique(),
    expiresAt: table.timestamp({ mode: "date" }).notNull(),
  }),
  table => [
    unique("organization_invitation_unique").on(
      table.organizationId,
      table.email
    ),
  ]
)
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect
export type NewOrganizationInvitation =
  typeof organizationInvitations.$inferInsert
export type OrganizationInvitationId = OrganizationInvitation["id"]
export type OrganizationInvitationPublicId = OrganizationInvitation["publicId"]

export const activityLogType = pgEnum("activity_log_type", [
  "accepted_organization_invitation",
  "created_asset",
  "created_organization",
  "declined_organization_invitation",
  "deleted_account",
  "deleted_email_verification_codes",
  "invited_member_to_organization",
  "marked_asset_as_uploaded",
  "marked_email_as_verified",
  "removed_organization_member",
  "requested_email_verification",
  "requested_password_reset",
  "requested_sign_in_code",
  "reset_password",
  "signed_in_with_code",
  "signed_in_with_github",
  "signed_in_with_google",
  "signed_in_with_password",
  "signed_out",
  "signed_up_with_code",
  "signed_up_with_github",
  "signed_up_with_google",
  "signed_up_with_password",
])

export const activityLogs = createTable("activity_logs", table => ({
  id: table
    .bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "ActivityLogId">>(),
  publicId: table
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("act"))
    .$type<Brand<string, "ActivityLogPublicId">>(),

  createdAt: table.timestamp({ mode: "date" }).defaultNow().notNull(),

  organizationId: table
    .bigint({ mode: "bigint" })
    .references(() => organizations.id)
    .$type<Brand<bigint, "OrganizationId">>(),
  accountId: table
    .bigint({ mode: "bigint" })
    .references(() => accounts.id)
    .$type<Brand<bigint, "AccountId">>(),

  type: activityLogType().notNull(),
  ipAddress: table.text(),
}))
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogPublicId = ActivityLog["publicId"]
export type ActivityLogType = ActivityLog["type"]
