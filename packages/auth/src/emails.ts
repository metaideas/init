import type { OrganizationOptions } from "better-auth/plugins"

import { sendEmail } from "@init/email"
import OrganizationInvitation from "@init/email/organization-invitation"

export const sendInvitationEmail: OrganizationOptions["sendInvitationEmail"] =
  async (data, request) => {
    const inviteLink = `${request?.headers.get("host")}/accept-invitation/${data.id}`

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
