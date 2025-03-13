import { organizationClient as organizationClientPlugin } from "better-auth/client/plugins"

import { accessControl, adminRole, memberRole, ownerRole } from "../permissions"

export function organizationClient() {
  return organizationClientPlugin({
    ac: accessControl,
    roles: {
      admin: adminRole,
      member: memberRole,
      owner: ownerRole,
    },
  })
}

export { expo } from "@better-auth/expo"
export * from "better-auth/client/plugins"
