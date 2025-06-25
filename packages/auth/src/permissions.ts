import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc as adminAccessControl,
  defaultStatements,
  memberAc as memberAccessControl,
  ownerAc as ownerAccessControl,
} from "better-auth/plugins/organization/access"

const statement = {
  ...defaultStatements,

  // Add your custom statements here
} as const

export const accessControl = createAccessControl(statement)

export const memberRole = accessControl.newRole({
  ...memberAccessControl.statements,
})

export const adminRole = accessControl.newRole({
  ...adminAccessControl.statements,
})

export const ownerRole = accessControl.newRole({
  ...ownerAccessControl.statements,
})
