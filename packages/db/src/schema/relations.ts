import { relations } from "drizzle-orm"

import { passwords, profiles, users } from "#schema/auth.ts"
import {
  accounts,
  activityLogs,
  organizationInvitations,
  organizations,
} from "#schema/organizations.ts"

export const userRelations = relations(users, ({ one, many }) => ({
  password: one(passwords, {
    fields: [users.id],
    references: [passwords.userId],
  }),

  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  accounts: many(accounts),
}))

export const accountRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id],
  }),

  invitations: many(organizationInvitations),
  activityLogs: many(activityLogs),
}))

export const organizationRelations = relations(organizations, ({ many }) => ({
  accounts: many(accounts),
  activityLogs: many(activityLogs),
}))

export const organizationInvitationRelations = relations(
  organizationInvitations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationInvitations.organizationId],
      references: [organizations.id],
    }),
    inviter: one(accounts, {
      fields: [organizationInvitations.inviterId],
      references: [accounts.id],
    }),
  })
)

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  account: one(accounts, {
    fields: [activityLogs.accountId],
    references: [accounts.id],
  }),
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
}))
