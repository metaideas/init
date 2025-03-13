import { organization as organizationPlugin } from "better-auth/plugins"

import { sendInvitationEmail } from "../emails"
import { accessControl, adminRole, memberRole, ownerRole } from "../permissions"

export function organization() {
  return organizationPlugin({
    ac: accessControl,
    roles: {
      admin: adminRole,
      member: memberRole,
      owner: ownerRole,
    },
    invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
    sendInvitationEmail,
  })
}

export * from "better-auth/plugins"
export { nextCookies } from "better-auth/next-js"
