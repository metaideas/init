import type { AuthenticationError } from "./auth"
import type { EmailError } from "./email"
import type { UtilityError } from "./utils"

export type AppError = AuthenticationError | EmailError | UtilityError

export * from "./auth"
export * from "./email"
export * from "./utils"
