import * as Faultier from "faultier"
import type { AuthenticationError } from "#domains/auth/errors.ts"
import type { EmailError } from "#services/email/errors.ts"
import type { PaymentsError } from "#services/payments/errors.ts"
import type { UtilityError } from "#shared/errors.ts"

import { AuthFault } from "#domains/auth/errors.ts"
import { EmailFault } from "#services/email/errors.ts"
import { PaymentsFault } from "#services/payments/errors.ts"
import { UtilityFault } from "#shared/errors.ts"

export const AppFault = Faultier.merge(AuthFault, EmailFault, PaymentsFault, UtilityFault)
export type AppError = AuthenticationError | EmailError | PaymentsError | UtilityError

export * from "#domains/auth/errors.ts"
export * from "#services/email/errors.ts"
export * from "#services/payments/errors.ts"
export * from "#shared/errors.ts"

export { matchTag, matchTags, Fault, isFault } from "faultier"
export type { SerializableFault } from "faultier/types"
