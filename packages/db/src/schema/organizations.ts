import type { Brand } from "@this/common/types"
import { bigint, jsonb, timestamp, unique, varchar } from "drizzle-orm/pg-core"

import { users } from "#schema/auth.ts"
import {
  activityType,
  invitationStatus,
  organizationRoles,
} from "#schema/enums.ts"
import { createTable, publicId, timestamps } from "#schema/helpers.ts"

export const organizations = createTable("organizations", {
  id: bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "OrganizationId">>(),

  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 64 }).notNull(),

  logo: varchar({ length: 512 }),
  metadata: jsonb(),

  ...timestamps,
  ...publicId<"OrganizationPublicId">("org"),
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]
export type OrganizationPublicId = Organization["publicId"]

export const members = createTable(
  "members",
  {
    id: bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "MemberId">>(),

    userId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<Brand<bigint, "UserId">>(),

    organizationId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),

    role: organizationRoles().notNull().default("member"),

    ...timestamps,
    ...publicId<"MemberPublicId">("org-mem"),
  },
  table => [
    unique("user_organization_unique").on(table.userId, table.organizationId),
  ]
)

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberPublicId = Member["publicId"]
export type MemberRole = Member["role"]

export const invitations = createTable(
  "invitations",
  {
    id: bigint({ mode: "bigint" })
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .primaryKey()
      .$type<Brand<bigint, "InvitationId">>(),

    organizationId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "OrganizationId">>(),

    inviterId: bigint({ mode: "bigint" })
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<Brand<bigint, "MemberId">>(),

    email: varchar({ length: 128 }).notNull(),
    role: organizationRoles().notNull().default("member"),
    status: invitationStatus().notNull().default("pending"),
    expiresAt: timestamp({ mode: "date" }).notNull(),

    ...publicId<"InvitationPublicId">("invite"),
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
export type InvitationPublicId = Invitation["publicId"]

export const activityLogs = createTable("activity_logs", {
  id: bigint({ mode: "bigint" })
    .generatedAlwaysAsIdentity({ startWith: 1 })
    .primaryKey()
    .$type<Brand<bigint, "ActivityLogId">>(),

  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),

  organizationId: bigint({ mode: "bigint" })
    .references(() => organizations.id)
    .$type<Brand<bigint, "OrganizationId">>(),
  memberId: bigint({ mode: "bigint" })
    .references(() => members.id)
    .$type<Brand<bigint, "MemberId">>(),

  type: activityType().notNull(),
  ipAddress: varchar({ length: 45 }),
  userAgent: varchar({ length: 1024 }),

  ...publicId<"ActivityLogPublicId">("act"),
})

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogPublicId = ActivityLog["publicId"]
export type ActivityLogType = ActivityLog["type"]
