import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

import { nextCookies } from "@init/auth/nextjs"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@init/auth/permissions"
import { createAuth } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { sendEmail } from "@init/email"
import OrganizationInvitation from "@init/email/organization-invitation"

import env from "~/shared/env"

export const auth = createAuth(
  {
    secret: env.AUTH_SECRET,
    baseURL: env.BASE_URL,
    database: database(),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        enabled: true,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        enabled: true,
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  },
  [
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

    nextCookies(),
  ]
)

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session

export const validateRequest = cache(async (): Promise<Session | null> => {
  const result = await auth.api.getSession({
    headers: await headers(),
  })

  if (!result) {
    return null
  }

  return result
})
