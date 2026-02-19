import * as Faultier from "faultier"

export class InvalidDurationParseInputError extends Faultier.Tagged(
  "InvalidDurationParseInputError"
)<{
  value: string
}>() {}

export class InvalidDurationFormatInputError extends Faultier.Tagged(
  "InvalidDurationFormatInputError"
)() {}

export class AssertUnreachableError extends Faultier.Tagged("AssertUnreachableError")<{
  value: unknown
}>() {}

export class AssertConditionFailedError extends Faultier.Tagged("AssertConditionFailedError")<{
  condition: string
}>() {}

export type DurationError = InvalidDurationParseInputError | InvalidDurationFormatInputError

export type AssertError = AssertUnreachableError | AssertConditionFailedError

export class InvalidBaseUrlError extends Faultier.Tagged("InvalidBaseUrlError")<{
  value: string
}>() {}

export const UtilityFault = Faultier.registry({
  AssertConditionFailedError,
  AssertUnreachableError,
  InvalidBaseUrlError,
  InvalidDurationFormatInputError,
  InvalidDurationParseInputError,
})

export type UtilityError = DurationError | AssertError | InvalidBaseUrlError
