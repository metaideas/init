import { relations } from "drizzle-orm"

import {
  accounts,
  activityLogs,
  invitations,
  members,
  organizations,
  sessions,
  users,
} from "./base"

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
