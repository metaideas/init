import * as Faultier from "faultier"

export class AssertUnreachableError extends Faultier.Tagged("AssertUnreachableError")<{
  value: string
}>() {}

export class AssertConditionFailedError extends Faultier.Tagged("AssertConditionFailedError")<{
  condition: string
}>() {}

export const UtilityFault = Faultier.registry({
  AssertConditionFailedError,
  AssertUnreachableError,
})

export type UtilityError = AssertUnreachableError | AssertConditionFailedError
