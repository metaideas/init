import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@init/auth/permissions"
import { createAuth } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { db } from "@init/db"
import { sendEmail } from "@init/email"
import OrganizationInvitation from "@init/email/organization-invitation"
import env from "~/shared/env"

const plugins = [
  admin(),
  organization({
    ac: accessControl,
    roles: {
      admin: adminRole,
      member: memberRole,
      owner: ownerRole,
    },
    invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
    sendInvitationEmail: async invitation => {
      const inviteLink = `${env.BASE_URL}/accept-invitation/${invitation.id}`

      await sendEmail(
        OrganizationInvitation({
          organizationName: invitation.organization.name,
          inviterName: invitation.inviter.user.name,
          inviterEmail: invitation.inviter.user.email,
          invitationUrl: inviteLink,
        }),
        {
          emails: [invitation.email],
          subject: `You've been invited to join ${invitation.organization.name}`,
        }
      )
    },
  }),
]

// !HACK(adelrodriguez): This is a workaround to allow us to build the types for
// the client, otherwise we get a "A type annotation is necessary" error. See
// this issue for more details:
// https://github.com/better-auth/better-auth/issues/1391
type Auth = ReturnType<typeof createAuth<typeof plugins>>

export const auth: Auth = createAuth(
  {
    basePath: "/auth",
    secret: env.AUTH_SECRET,
    baseURL: env.BASE_URL,
    database: db,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  plugins
)

export type Session = typeof auth.$Infer.Session
