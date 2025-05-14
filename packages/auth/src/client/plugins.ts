import { adminClient, organizationClient } from "better-auth/client/plugins"

import { accessControl, adminRole, memberRole, ownerRole } from "../permissions"

export const organizationClientPlugin = organizationClient({
  ac: accessControl,
  roles: {
    admin: adminRole,
    member: memberRole,
    owner: ownerRole,
  },
})

export const adminClientPlugin = adminClient()
