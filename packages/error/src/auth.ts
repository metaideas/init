import * as Faultier from "faultier"

export class UnauthenticatedError extends Faultier.Tagged("UnauthenticatedError")() {}

export class UnauthorizedError extends Faultier.Tagged("UnauthorizedError")<{
  userId: string
}>() {}

export type AuthenticationError = UnauthenticatedError | UnauthorizedError
export const AuthFault = Faultier.registry({ UnauthenticatedError, UnauthorizedError })
