import { TaggedError } from "better-result"

export class UnauthenticatedError extends TaggedError("AuthenticationError")() {}

export class UnauthorizedError extends TaggedError("AuthorizationError")<{ userId: string }>() {}

export type AuthenticationError = UnauthenticatedError | UnauthorizedError
