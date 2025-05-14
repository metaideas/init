import { admin, organization } from "better-auth/plugins"

import { sendInvitationEmail } from "../emails"
import { accessControl, adminRole, memberRole, ownerRole } from "../permissions"

export const organizationPlugin = organization({
  ac: accessControl,
  roles: {
    admin: adminRole,
    member: memberRole,
    owner: ownerRole,
  },
  invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
  sendInvitationEmail,
})

export const adminPlugin = admin({
  defaultRole: "user",
})
