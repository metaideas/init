import * as Faultier from "faultier"
import type { AuthenticationError } from "#errors/auth.ts"
import type { EmailError } from "#errors/email.ts"
import type { UtilityError } from "#errors/utils.ts"

import { AuthFault } from "#errors/auth.ts"
import { EmailFault } from "#errors/email.ts"
import { UtilityFault } from "#errors/utils.ts"

export const AppFault = Faultier.merge(AuthFault, EmailFault, UtilityFault)
export type AppError = AuthenticationError | EmailError | UtilityError

export * from "#errors/auth.ts"
export * from "#errors/email.ts"
export * from "#errors/utils.ts"

export { matchTag, matchTags, Fault, isFault } from "faultier"
export type { SerializableFault } from "faultier/types"
