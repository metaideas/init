import { unique } from "drizzle-orm/sqlite-core"

import type { Brand } from "@this/common/types"
import { users } from "#schema/auth.ts"
import { createPublicId, createTable, timestamps } from "#schema/helpers.ts"

export const organizations = createTable("organizations", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "OrganizationId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("org"))
    .$type<Brand<string, "OrganizationPublicId">>(),

  name: t.text().notNull(),

  ...timestamps,
}))
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]
export type OrganizationPublicId = Organization["publicId"]

export const accounts = createTable(
  "accounts",
  t => ({
    id: t
      .integer()
      .primaryKey({ autoIncrement: true })
      .$type<Brand<bigint, "AccountId">>(),
    publicId: t
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("acc"))
      .$type<Brand<string, "AccountPublicId">>(),

    userId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<Brand<number, "UserId">>(),
    organizationId: t
      .integer()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<number, "OrganizationId">>(),

    role: t
      .text({ enum: ["member", "admin", "owner"] })
      .notNull()
      .default("member"),

    ...timestamps,
  }),
  t => ({
    userOrganizationUnique: unique("user_organization_unique").on(
      t.userId,
      t.organizationId
    ),
  })
)
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]
export type AccountPublicId = Account["publicId"]
export type AccountRole = Account["role"]

export const organizationInvitations = createTable(
  "organization_invitations",
  t => ({
    id: t
      .integer()
      .primaryKey({ autoIncrement: true })
      .$type<Brand<number, "OrganizationInvitationId">>(),
    publicId: t
      .text()
      .notNull()
      .unique()
      .$defaultFn(createPublicId("org-invite"))
      .$type<Brand<string, "OrganizationInvitationPublicId">>(),

    organizationId: t
      .integer()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<number, "OrganizationId">>(),
    inviterId: t
      .integer()
      .notNull()
      .references(() => accounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<number, "AccountId">>(),

    email: t.text().notNull(),
    role: t
      .text({ enum: ["member", "admin", "owner"] })
      .notNull()
      .default("member"),
    token: t.text().notNull().unique(),
    expiresAt: t.integer({ mode: "timestamp" }).notNull(),

    ...timestamps,
  }),
  t => ({
    organizationInvitationUnique: unique("organization_invitation_unique").on(
      t.organizationId,
      t.email
    ),
  })
)
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect
export type NewOrganizationInvitation =
  typeof organizationInvitations.$inferInsert
export type OrganizationInvitationId = OrganizationInvitation["id"]
export type OrganizationInvitationPublicId = OrganizationInvitation["publicId"]

export const activityLogs = createTable("activity_logs", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "ActivityLogId">>(),
  publicId: t
    .text()
    .notNull()
    .unique()
    .$defaultFn(createPublicId("act"))
    .$type<Brand<string, "ActivityLogPublicId">>(),

  createdAt: t
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),

  organizationId: t
    .integer()
    .references(() => organizations.id)
    .$type<Brand<number, "OrganizationId">>(),
  accountId: t
    .integer()
    .references(() => accounts.id)
    .$type<Brand<number, "AccountId">>(),

  type: t
    .text({
      enum: [
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
      ],
    })
    .notNull(),
  ipAddress: t.text(),
  userAgent: t.text(),
}))
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogPublicId = ActivityLog["publicId"]
export type ActivityLogType = ActivityLog["type"]
