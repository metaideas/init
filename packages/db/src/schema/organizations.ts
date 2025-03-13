import { integer, text, unique } from "drizzle-orm/sqlite-core"

import { users } from "./auth"
import { activityType, invitationStatus, organizationRoles } from "./enums"
import { type BrandId, constructId, createTable, timestamps } from "./helpers"

export const organizations = createTable("organizations", {
  ...constructId("OrganizationId", "org"),

  name: text().notNull(),
  slug: text().notNull(),

  logo: text(),
  metadata: text({ mode: "json" }),

  ...timestamps,
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]

export const members = createTable(
  "members",
  {
    ...constructId("MemberId", "mbr"),

    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<BrandId<"UserId">>(),

    organizationId: text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<BrandId<"OrganizationId">>(),

    role: text({ enum: organizationRoles }).notNull().default("member"),

    ...timestamps,
  },
  table => [
    unique("user_organization_unique").on(table.userId, table.organizationId),
  ]
)

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberRole = Member["role"]

export const invitations = createTable(
  "invitations",
  {
    ...constructId("InvitationId", "inv"),

    organizationId: text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<BrandId<"OrganizationId">>(),

    inviterId: text()
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<BrandId<"MemberId">>(),

    email: text().notNull(),
    role: text({ enum: organizationRoles }).notNull().default("member"),
    status: text({ enum: invitationStatus }).notNull().default("pending"),
    expiresAt: integer({ mode: "timestamp" }).notNull(),

    ...timestamps,
  },
  table => [
    unique("organization_invitation_unique").on(
      table.organizationId,
      table.email
    ),
  ]
)

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type InvitationId = Invitation["id"]

export const activityLogs = createTable("activity_logs", {
  ...constructId("ActivityLogId", "act"),

  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  organizationId: text()
    .references(() => organizations.id)
    .$type<BrandId<"OrganizationId">>(),
  memberId: text()
    .references(() => members.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<BrandId<"MemberId">>(),

  type: text({ enum: activityType }).notNull(),
  ipAddress: text(),
  userAgent: text(),
})

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogType = ActivityLog["type"]
