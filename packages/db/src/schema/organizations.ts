import { unique } from "drizzle-orm/sqlite-core"

import type { Brand } from "@this/common/types"
import { users } from "#schema/auth.ts"
import { createTable, publicId, timestamps } from "#schema/helpers.ts"

const ORGANIZATION_ROLES = ["member", "admin", "owner"] as const

export const organizations = createTable("organizations", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "OrganizationId">>(),

  name: t.text().notNull(),
  slug: t.text().notNull(),

  logo: t.text(),
  metadata: t.text({ mode: "json" }),

  ...timestamps,
  ...publicId<"OrganizationPublicId">("org"),
}))
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]
export type OrganizationPublicId = Organization["publicId"]

export const members = createTable(
  "members",
  t => ({
    id: t
      .integer()
      .primaryKey({ autoIncrement: true })
      .$type<Brand<bigint, "MemberId">>(),

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

    role: t.text({ enum: ORGANIZATION_ROLES }).notNull().default("member"),

    ...timestamps,
    ...publicId<"MemberPublicId">("org-mem"),
  }),
  t => ({
    userOrganizationUnique: unique("user_organization_unique").on(
      t.userId,
      t.organizationId
    ),
  })
)
export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberPublicId = Member["publicId"]
export type MemberRole = Member["role"]

export const invitations = createTable(
  "invitations",
  t => ({
    id: t
      .integer()
      .primaryKey({ autoIncrement: true })
      .$type<Brand<number, "InvitationId">>(),

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
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<number, "MemberId">>(),

    email: t.text().notNull(),
    role: t.text({ enum: ORGANIZATION_ROLES }).notNull().default("member"),
    status: t
      .text({ enum: ["pending", "accepted", "rejected", "canceled"] })
      .notNull()
      .default("pending"),
    expiresAt: t.integer({ mode: "timestamp" }).notNull(),

    ...publicId<"InvitationPublicId">("invite"),
    ...timestamps,
  }),
  t => ({
    organizationInvitationUnique: unique("organization_invitation_unique").on(
      t.organizationId,
      t.email
    ),
  })
)
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type InvitationId = Invitation["id"]
export type InvitationPublicId = Invitation["publicId"]

export const activityLogs = createTable("activity_logs", t => ({
  id: t
    .integer()
    .primaryKey({ autoIncrement: true })
    .$type<Brand<number, "ActivityLogId">>(),

  createdAt: t
    .integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),

  organizationId: t
    .integer()
    .references(() => organizations.id)
    .$type<Brand<number, "OrganizationId">>(),
  memberId: t
    .integer()
    .references(() => members.id)
    .$type<Brand<number, "MemberId">>(),

  type: t
    .text({
      enum: [
        "accepted_invitation",
        "created_asset",
        "created_organization",
        "declined_invitation",
        "deleted_account",
        "invited_member",
        "marked_asset_as_uploaded",
        "marked_email_as_verified",
        "removed_member",
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

  ...publicId<"ActivityLogPublicId">("act"),
}))
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogPublicId = ActivityLog["publicId"]
export type ActivityLogType = ActivityLog["type"]
