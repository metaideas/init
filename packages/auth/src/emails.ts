import type { OrganizationOptions } from "better-auth/plugins"

import { sendEmail } from "@this/email"
import OrganizationInvitation from "@this/email/organization-invitation"
import env from "@this/env/auth"

export const sendInvitationEmail: OrganizationOptions["sendInvitationEmail"] =
  async data => {
    const inviteLink = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`

    await sendEmail({
      emails: [data.email],
      subject: "Accept Invitation",
      body: OrganizationInvitation({
        organizationName: data.organization.name,
        inviterName: data.inviter.user.name,
        inviterEmail: data.inviter.user.email,
        invitationUrl: inviteLink,
      }),
    })
  }
