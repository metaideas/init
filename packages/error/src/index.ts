import * as Faultier from "faultier"
import type { AuthenticationError } from "#auth.ts"
import type { EmailError } from "#email.ts"
import type { UtilityError } from "#utils.ts"

import { AuthFault } from "#auth.ts"
import { EmailFault } from "#email.ts"
import { UtilityFault } from "#utils.ts"

export const AppFault = Faultier.merge(AuthFault, EmailFault, UtilityFault)
export type AppError = AuthenticationError | EmailError | UtilityError

export * from "#auth.ts"
export * from "#email.ts"
export * from "#utils.ts"

export { matchTag, matchTags, Fault } from "faultier"
