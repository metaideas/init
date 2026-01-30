import { TaggedError } from "better-result"

export class InvalidDurationParseInputError extends TaggedError("InvalidDurationParseInputError")<{
  message: string
  value: string
}>() {
  constructor(props: { value: string }) {
    super({ ...props, message: `Unable to parse duration from input: "${props.value}"` })
  }
}

export class InvalidDurationFormatInputError extends TaggedError(
  "InvalidDurationFormatInputError"
)<{ message: string }>() {
  constructor() {
    super({ message: "Invalid duration format provided" })
  }
}

export class AssertUnreachableError extends TaggedError("AssertUnreachableError")<{
  value: unknown
}>() {}

export class AssertConditionFailedError extends TaggedError("AssertConditionFailedError")<{
  message: string
  condition: string
}>() {}

export type DurationError = InvalidDurationParseInputError | InvalidDurationFormatInputError

export type AssertError = AssertUnreachableError | AssertConditionFailedError

export type UtilityError = DurationError | AssertError
