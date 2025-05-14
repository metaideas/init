import {
  boolean,
  index,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { type BrandId, constructId, timestamps } from "./helpers"

// Auth
export const authSchema = pgSchema("auth")

export const userRoles = authSchema.enum("user_roles", ["user", "admin"])

export const users = authSchema.table(
  "users",
  {
    ...constructId("UserId", "usr"),

    role: userRoles().notNull().default("user"),

    name: varchar({ length: 128 }).notNull(),
    image: text(),

    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean().notNull().default(false),

    banned: boolean().notNull().default(false),
    banReason: text(),
    banExpiresAt: timestamp({ mode: "date" }),

    metadata: jsonb(),

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

export const accounts = authSchema.table(
  "accounts",
  {
    ...constructId("AccountId", "acc"),

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

    accessTokenExpiresAt: timestamp({ mode: "date" }),
    refreshTokenExpiresAt: timestamp({ mode: "date" }),

    scope: text(),
    idToken: text(),

    password: varchar({ length: 255 }),

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

export const verifications = authSchema.table(
  "verifications",
  {
    ...constructId("VerificationId", "ver"),

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

export const sessions = authSchema.table("sessions", {
  ...constructId("SessionId", "ses"),

  userId: text()
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<BrandId<"UserId">>(),

  token: text().notNull().unique(),
  expiresAt: timestamp({ mode: "date" }).notNull(),

  impersonatedBy: text()
    .references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<BrandId<"UserId">>(),

  ipAddress: varchar({ length: 45 }),
  userAgent: text(),

  activeOrganizationId: text()
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    })
    .$type<BrandId<"OrganizationId">>(),

  ...timestamps,
})
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

// Organization
export const organizationSchema = pgSchema("organization")

export const organizationRoles = organizationSchema.enum("organization_roles", [
  "member",
  "admin",
  "owner",
])

export const invitationStatus = organizationSchema.enum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "canceled",
])

export const activityType = organizationSchema.enum("activity_type", [
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
])

export const organizations = organizationSchema.table("organizations", {
  ...constructId("OrganizationId", "org"),

  name: varchar({ length: 128 }).notNull(),
  slug: varchar({ length: 128 }).notNull(),

  logo: text(),
  metadata: jsonb(),

  ...timestamps,
})
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]

export const members = organizationSchema.table(
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

    role: organizationRoles().notNull().default("member"),

    ...timestamps,
  },
  table => [
    uniqueIndex("user_organization_unique_idx").on(
      table.userId,
      table.organizationId
    ),
    index("members_user_id_idx").on(table.userId),
    index("members_organization_id_idx").on(table.organizationId),
  ]
)
export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberRole = Member["role"]

export const invitations = organizationSchema.table(
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

    email: varchar({ length: 255 }).notNull(),
    role: organizationRoles().notNull().default("member"),
    status: invitationStatus().notNull().default("pending"),
    expiresAt: timestamp({ mode: "date" }).notNull(),

    ...timestamps,
  },
  table => [
    uniqueIndex("organization_invitation_unique_idx").on(
      table.organizationId,
      table.email
    ),
    index("invitations_organization_id_idx").on(table.organizationId),
    index("invitations_email_idx").on(table.email),
  ]
)

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type InvitationId = Invitation["id"]

export const activityLogs = organizationSchema.table(
  "activity_logs",
  {
    ...constructId("ActivityLogId", "act"),

    createdAt: timestamp({ mode: "date" })
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

    type: activityType().notNull(),
    ipAddress: varchar({ length: 45 }),
    userAgent: text(),
  },
  table => [
    index("activity_logs_organization_id_idx").on(table.organizationId),
    index("activity_logs_member_id_idx").on(table.memberId),
    index("activity_logs_type_idx").on(table.type),
  ]
)
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogType = ActivityLog["type"]
