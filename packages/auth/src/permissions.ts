import {
  adminAc,
  createAccessControl,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/access"

const statement = {
  ...defaultStatements,

  member: ["create", "read", "update", "delete"],
  admin: ["create", "read", "update", "delete"],
  owner: ["create", "read", "update", "delete"],
} as const

export const accessControl = createAccessControl(statement)

export const memberRole = accessControl.newRole({
  ...memberAc.statements,

  member: ["read"],
  admin: ["read"],
  owner: ["read"],
})

export const adminRole = accessControl.newRole({
  ...adminAc.statements,

  member: ["create", "read", "update", "delete"],
  admin: ["read"],
  owner: ["read"],
})

export const ownerRole = accessControl.newRole({
  ...ownerAc.statements,

  member: ["create", "read", "update", "delete"],
  admin: ["create", "read", "update", "delete"],
  owner: ["create", "read", "update", "delete"],
})
