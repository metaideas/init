import type { AuthenticationError } from "#auth.ts"
import type { EmailError } from "#email.ts"
import type { UtilityError } from "#utils.ts"

export type AppError = AuthenticationError | EmailError | UtilityError

export * from "#auth.ts"
export * from "#email.ts"
export * from "#utils.ts"
