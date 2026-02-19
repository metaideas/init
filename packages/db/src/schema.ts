import type { StorageBucket } from "@init/storage/buckets"
import type { MimeType } from "@init/storage/helpers"
import type { ConstrainedString } from "@init/utils/type"
import { createIdGenerator } from "@init/utils/id"
import * as z from "@init/utils/schema"
import * as pg from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm/relations"

export const createTable = pg.pgTableCreator((name) => name)

export const UNIQUE_ID_LENGTH = 24

export function id<B extends string, P extends string>(brand: B, prefix: ConstrainedString<P, 4>) {
  const IdSchema = z.branded(brand)

  const generateId = createIdGenerator({ prefix, size: UNIQUE_ID_LENGTH })

  return {
    id: pg
      .text()
      .notNull()
      .primaryKey()
      .$defaultFn(() => generateId())
      .$type<z.infer<typeof IdSchema>>(),
  }
}

export const timestamps = {
  createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: pg
    .timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}

// Insert your tables here
export const documents = createTable("documents", {
  ...id("DocumentId", "doc"),
  ...timestamps,

  content: pg.text().notNull(),
  name: pg.text().notNull(),
})

// ==========================AUTH==========================
export const authSchema = pg.pgSchema("auth")

export const userRole = authSchema.enum("user_role", ["user", "admin"])

export const users = authSchema.table(
  "users",
  {
    ...id("UserId", "user"),
    ...timestamps,

    banExpiresAt: pg.timestamp({ withTimezone: true }),
    banReason: pg.text(),
    banned: pg.boolean().notNull().default(false),

    email: pg.text().notNull().unique(),
    emailVerified: pg.boolean().notNull().default(false),

    image: pg.text(),

    metadata: pg.jsonb(),

    name: pg.text().notNull(),

    role: userRole().notNull().default("user"),
  },
  (table) => [
    pg.index("users_email_idx").on(table.email),
    pg.index("users_role_idx").on(table.role),
    pg.index("auth_users_banned_idx").on(table.banned),
  ]
)
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserId = User["id"]
export type UserRole = User["role"]

export const accounts = authSchema.table(
  "accounts",
  {
    ...id("AccountId", "acct"),
    ...timestamps,

    accessToken: pg.text(),
    accessTokenExpiresAt: pg.timestamp({ withTimezone: true }),

    accountId: pg.text().notNull(),

    idToken: pg.text(),

    password: pg.text(),

    providerId: pg.text().notNull(),

    refreshToken: pg.text(),
    refreshTokenExpiresAt: pg.timestamp({ withTimezone: true }),

    scope: pg.text(),

    userId: pg
      .text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<UserId>(),
  },
  (table) => [
    pg.index("auth_accounts_user_id_idx").on(table.userId),
    pg.index("auth_accounts_provider_idx").on(table.providerId),
    pg
      .uniqueIndex("auth_accounts_provider_account_unique_idx")
      .on(table.providerId, table.accountId),
  ]
)
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type AccountId = Account["id"]

export const verifications = authSchema.table(
  "verifications",
  {
    ...id("VerificationId", "verf"),
    ...timestamps,

    identifier: pg.text().notNull(),
    value: pg.text().notNull(),

    expiresAt: pg.timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    pg.index("auth_verifications_identifier_idx").on(table.identifier),
    pg.index("auth_verifications_expires_idx").on(table.expiresAt),
    pg.uniqueIndex("auth_verifications_value_unique_idx").on(table.value),
  ]
)
export type Verification = typeof verifications.$inferSelect
export type NewVerification = typeof verifications.$inferInsert

export const sessions = authSchema.table(
  "sessions",
  {
    ...id("SessionId", "sess"),
    ...timestamps,

    expiresAt: pg.timestamp({ withTimezone: true }).notNull(),

    impersonatedBy: pg
      .text()
      .references(() => users.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      })
      .$type<UserId>(),

    token: pg.text().notNull().unique(),

    userId: pg
      .text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<UserId>(),

    ipAddress: pg.text(),
    userAgent: pg.text(),

    activeOrganizationId: pg
      .text()
      .references(() => organizations.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),
  },
  (table) => [
    pg.index("auth_sessions_user_id_idx").on(table.userId),
    pg.index("auth_sessions_token_idx").on(table.token),
    pg.index("auth_sessions_expires_at_idx").on(table.expiresAt),
    pg.index("auth_sessions_ip_address_idx").on(table.ipAddress),
    pg.index("auth_sessions_active_organization_id_idx").on(table.activeOrganizationId),
  ]
)
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

// ==========================ORGANIZATION==========================
export const organizationSchema = pg.pgSchema("organization")

export const organizations = organizationSchema.table(
  "organizations",
  {
    ...id("OrganizationId", "org"),
    ...timestamps,

    name: pg.text().notNull(),
    slug: pg.text().notNull().unique(),

    logo: pg.text(),
    metadata: pg.jsonb(),
  },
  (table) => [pg.index("organizations_slug_idx").on(table.slug)]
)
export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
export type OrganizationId = Organization["id"]

export const memberRole = organizationSchema.enum("member_role", ["member", "admin", "owner"])

export const members = organizationSchema.table(
  "members",
  {
    ...id("MemberId", "memb"),
    ...timestamps,

    userId: pg
      .text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .$type<UserId>(),

    organizationId: pg
      .text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    role: memberRole().notNull().default("member"),
  },
  (table) => [
    pg
      .uniqueIndex("organization_members_user_organization_unique_idx")
      .on(table.userId, table.organizationId),
    pg.index("organization_members_user_id_idx").on(table.userId),
    pg.index("organization_members_organization_id_idx").on(table.organizationId),
  ]
)
export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type MemberId = Member["id"]
export type MemberRole = Member["role"]

export const invitationStatus = organizationSchema.enum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "canceled",
])

export const invitations = organizationSchema.table(
  "invitations",
  {
    ...id("InvitationId", "invt"),
    ...timestamps,

    email: pg.text().notNull(),

    expiresAt: pg.timestamp({ withTimezone: true }).notNull(),

    inviterId: pg
      .text()
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<MemberId>(),

    organizationId: pg
      .text()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    role: memberRole().notNull().default("member"),

    status: invitationStatus().notNull().default("pending"),
  },
  (table) => [
    pg
      .uniqueIndex("organization_invitations_organization_email_unique_idx")
      .on(table.organizationId, table.email),
    pg.index("organization_invitations_organization_id_idx").on(table.organizationId),
    pg.index("organization_invitations_email_idx").on(table.email),
  ]
)

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type InvitationId = Invitation["id"]
export type InvitationStatus = Invitation["status"]

export const activityLogs = organizationSchema.table(
  "activity_logs",
  {
    ...id("ActivityLogId", "alog"),

    createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),

    ipAddress: pg.text(),

    memberId: pg
      .text()
      .references(() => members.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<MemberId>(),

    organizationId: pg
      .text()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    type: pg
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

    userAgent: pg.text(),
  },
  (table) => [
    pg.index("organization_activity_logs_organization_id_idx").on(table.organizationId),
    pg.index("organization_activity_logs_member_id_idx").on(table.memberId),
    pg.index("organization_activity_logs_type_idx").on(table.type),
  ]
)
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type ActivityLogId = ActivityLog["id"]
export type ActivityLogType = ActivityLog["type"]

// ==========================STORAGE==========================
export const storageSchema = pg.pgSchema("storage")

export const assetStatus = storageSchema.enum("asset_status", [
  "pending",
  "uploading",
  "available",
  "processing",
  "failed",
  "deleted",
])

export const storageProvider = storageSchema.enum("storage_provider", ["s3", "r2"])

export const assets = storageSchema.table(
  "assets",
  {
    ...id("AssetId", "asst"),
    ...timestamps,

    bucket: pg.text().notNull().$type<StorageBucket>(),

    errorMessage: pg.text(),

    expiresAt: pg.timestamp({ withTimezone: true }),

    key: pg.text().notNull(),

    metadata: pg.jsonb(),

    mimeType: pg.text().notNull().$type<MimeType>(),

    name: pg.text().notNull(),

    organizationId: pg
      .text()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<OrganizationId>(),

    provider: storageProvider().notNull().default("s3"),

    size: pg.integer().notNull(),

    status: assetStatus().notNull().default("pending"),

    uploaderId: pg
      .text()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .$type<UserId>(),
  },
  (table) => [
    pg.index("storage_assets_uploader_id_idx").on(table.uploaderId),
    pg.index("storage_assets_organization_id_idx").on(table.organizationId),
    pg.index("storage_assets_bucket_idx").on(table.bucket),
    pg.index("storage_assets_provider_idx").on(table.provider),
    pg.index("storage_assets_status_idx").on(table.status),
    pg.index("storage_assets_expires_at_idx").on(table.expiresAt),
    pg.uniqueIndex("storage_assets_bucket_key_unique_idx").on(table.bucket, table.key),
  ]
)

export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
export type AssetId = Asset["id"]
export type AssetStatus = Asset["status"]
export type StorageProvider = Asset["provider"]

// Relations

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  impersonationSessions: many(sessions, {
    relationName: "impersonator",
  }),
  members: many(members),
  sessions: many(sessions, { relationName: "user" }),
  uploadedAssets: many(assets),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  activeOrganization: one(organizations, {
    fields: [sessions.activeOrganizationId],
    references: [organizations.id],
  }),
  impersonatedBy: one(users, {
    fields: [sessions.impersonatedBy],
    references: [users.id],
    relationName: "impersonator",
  }),
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: "user",
  }),
}))

export const memberRelations = relations(members, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),

  activityLogs: many(activityLogs),
  invitations: many(invitations),
}))

export const organizationRelations = relations(organizations, ({ many }) => ({
  activityLogs: many(activityLogs),
  assets: many(assets),
  invitations: many(invitations),
  members: many(members),
}))

export const invitationRelations = relations(invitations, ({ one }) => ({
  inviter: one(members, {
    fields: [invitations.inviterId],
    references: [members.id],
  }),
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
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

export const assetRelations = relations(assets, ({ one }) => ({
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
  uploader: one(users, {
    fields: [assets.uploaderId],
    references: [users.id],
  }),
}))
