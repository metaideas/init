import { generatePrefixedId } from "@init/utils/id"
import * as z from "@init/utils/schema"
import type { ConstrainedString } from "@init/utils/type"
import { relations } from "drizzle-orm/relations"
import {
  index,
  integer,
  sqliteTableCreator,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

export const createTable = sqliteTableCreator((name) => name)

export const UNIQUE_ID_LENGTH = 24

export function id<B extends string, P extends string>(
  brand: B,
  prefix: ConstrainedString<P, 4>
) {
  const IdSchema = z.branded(brand)

  return {
    id: text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => generatePrefixedId(prefix, UNIQUE_ID_LENGTH))
      .$type<z.infer<typeof IdSchema>>(),
  }
}

export const timestamps = {
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}

// Auth tables
export const users = createTable(
  "users",
  {
    ...id("UserId", "user"),
    ...timestamps,

    role: text({ enum: ["user", "admin"] })
      .notNull()
      .default("user"),

    name: text({ length: 128 }).notNull(),
    image: text(),

    email: text({ length: 255 }).notNull().unique(),
    emailVerified: integer({ mode: "boolean" }).notNull().default(false),

    banned: integer({ mode: "boolean" }).notNull().default(false),
    banReason: text(),
    banExpiresAt: integer({ mode: "timestamp_ms" }),

    metadata: text({ mode: "json" }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ]
)
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserId = User["id"]
export type UserRole = User["role"]

export const accounts = createTable(
  "auth_accounts",
  {
    ...id("AccountId", "acct"),
    ...timestamps,

    userId: text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<UserId>(),

    accountId: text().notNull(),
    providerId: text().notNull(),

    accessToken: text(),
    refreshToken: text(),

    accessTokenExpiresAt: integer({ mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer({ mode: "timestamp_ms" }),

    scope: text(),
    idToken: text(),

    password: text({ length: 255 }),
  },
  (table) => [
    index("auth_accounts_user_id_idx").on(table.userId),
    index("auth_accounts_provider_idx").on(table.providerId),
    uniqueIndex("auth_accounts_provider_account_unique_idx").on(
      table.providerId,
      table.accountId
    ),
  ]
)
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]

export const verifications = createTable(
  "auth_verifications",
  {
    ...id("VerificationId", "verf"),
    ...timestamps,

    identifier: text({ length: 255 }).notNull(),
    value: text({ length: 255 }).notNull(),

    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("auth_verifications_identifier_idx").on(table.identifier),
    index("auth_verifications_expires_idx").on(table.expiresAt),
    uniqueIndex("auth_verifications_value_unique_idx").on(table.value),
  ]
)
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert

export const sessions = createTable(
  "auth_sessions",
  {
    ...id("SessionId", "sess"),
    ...timestamps,

    userId: text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<UserId>(),

    token: text().notNull().unique(),
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),

    impersonatedBy: text()
      .references(() => users.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      })
      .$type<UserId>(),

    ipAddress: text({ length: 45 }),
    userAgent: text(),

    activeOrganizationId: text()
      .references(() => organizations.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_token_idx").on(table.token),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
    index("auth_sessions_active_organization_id_idx").on(table.activeOrganizationId),
  ]
)
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

// Organization tables
export const organizations = createTable(
  "organizations",
  {
    ...id("OrganizationId", "org"),
    ...timestamps,

    name: text({ length: 128 }).notNull(),
    slug: text({ length: 128 }).notNull().unique(),

    logo: text(),
    metadata: text({ mode: "json" }),
  },
  (table) => [index("organizations_slug_idx").on(table.slug)]
)
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]

export const members = createTable(
  "organization_members",
  {
    ...id("MemberId", "memb"),
    ...timestamps,

    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<UserId>(),

    organizationId: text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    role: text({ enum: ["member", "admin", "owner"] })
      .notNull()
      .default("member"),
  },
  (table) => [
    uniqueIndex("organization_members_user_organization_unique_idx").on(
      table.userId,
      table.organizationId
    ),
    index("organization_members_user_id_idx").on(table.userId),
    index("organization_members_organization_id_idx").on(table.organizationId),
  ]
)
export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberRole = Member["role"]

export const invitations = createTable(
  "organization_invitations",
  {
    ...id("InvitationId", "invt"),
    ...timestamps,

    organizationId: text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    inviterId: text()
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<MemberId>(),

    email: text({ length: 255 }).notNull(),
    role: text({ enum: ["member", "admin", "owner"] })
      .notNull()
      .default("member"),
    status: text({ enum: ["pending", "accepted", "rejected", "canceled"] })
      .notNull()
      .default("pending"),
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("organization_invitations_organization_email_unique_idx").on(
      table.organizationId,
      table.email
    ),
    index("organization_invitations_organization_id_idx").on(table.organizationId),
    index("organization_invitations_email_idx").on(table.email),
  ]
)

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type InvitationId = Invitation["id"]

export const activityLogs = createTable(
  "organization_activity_logs",
  {
    ...id("ActivityLogId", "alog"),

    createdAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),

    organizationId: text()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),
    memberId: text()
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<MemberId>(),

    type: text({
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
    }).notNull(),
    ipAddress: text({ length: 45 }),
    userAgent: text(),
  },
  (table) => [
    index("organization_activity_logs_organization_id_idx").on(table.organizationId),
    index("organization_activity_logs_member_id_idx").on(table.memberId),
    index("organization_activity_logs_type_idx").on(table.type),
  ]
)
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogType = ActivityLog["type"]

// Relations

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions, { relationName: "user" }),
  members: many(members),
  impersonationSessions: many(sessions, {
    relationName: "impersonator",
  }),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: "user",
  }),
  activeOrganization: one(organizations, {
    fields: [sessions.activeOrganizationId],
    references: [organizations.id],
  }),
  impersonatedBy: one(users, {
    fields: [sessions.impersonatedBy],
    references: [users.id],
    relationName: "impersonator",
  }),
}))

export const memberRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),

  invitations: many(invitations),
  activityLogs: many(activityLogs),
}))

export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}))

export const invitationRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(members, {
    fields: [invitations.inviterId],
    references: [members.id],
  }),
}))

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  member: one(members, {
    fields: [activityLogs.memberId],
    references: [members.id],
  }),
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
}))
