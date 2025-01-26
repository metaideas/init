import type { Brand } from "@this/common/types"
import { jsonb, timestamp, unique, varchar } from "drizzle-orm/pg-core"

import { users } from "#schema/auth.ts"
import {
  activityType,
  invitationStatus,
  organizationRoles,
} from "#schema/enums.ts"
import { createTable, id, timestamps } from "#schema/helpers.ts"

export const organizations = createTable("organizations", {
  ...id<"OrganizationId">("org"),

  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 64 }).notNull(),

  logo: varchar({ length: 512 }),
  metadata: jsonb(),

  ...timestamps,
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]

export const members = createTable(
  "members",
  {
    ...id<"MemberId">("mbr"),

    userId: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<Brand<string, "UserId">>(),

    organizationId: varchar({ length: 255 })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<string, "OrganizationId">>(),

    role: organizationRoles().notNull().default("member"),

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
    ...id<"InvitationId">("inv"),

    organizationId: varchar({ length: 255 })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<string, "OrganizationId">>(),

    inviterId: varchar({ length: 255 })
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<string, "MemberId">>(),

    email: varchar({ length: 128 }).notNull(),
    role: organizationRoles().notNull().default("member"),
    status: invitationStatus().notNull().default("pending"),
    expiresAt: timestamp({ mode: "date" }).notNull(),

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
  ...id<"ActivityLogId">("act"),

  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),

  organizationId: varchar({ length: 255 })
    .references(() => organizations.id)
    .$type<Brand<string, "OrganizationId">>(),
  memberId: varchar({ length: 255 })
    .references(() => members.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<Brand<string, "MemberId">>(),

  type: activityType().notNull(),
  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 1024 }),
})

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogType = ActivityLog["type"]
