import { AssertConditionFailedError, AssertUnreachableError } from "@init/error"

/**
 * Asserts that a value is never, and throws an error if it is. Use this to make
 * sure that all cases in a `switch` statement are handled.
 */
export function assertUnreachable(x: never): never {
  throw new AssertUnreachableError({ value: x })
}

/**
 * Throws an error if a condition is not met.
 */
export function throwUnless(condition: boolean, message: string): asserts condition is true {
  if (!condition) {
    throw new AssertConditionFailedError({ condition: "throwUnless" }).withMessage(message)
  }
}

/**
 * Throws an error if a condition is met.
 */
export function throwIf(condition: boolean, message: string): asserts condition is false {
  if (condition) {
    throw new AssertConditionFailedError({ condition: "throwIf" }).withMessage(message)
  }
}
