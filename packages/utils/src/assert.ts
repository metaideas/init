import { Fault } from "@init/error/fault"

/**
 * Asserts that a value is never, and throws an error if it is. Use this to make
 * sure that all cases in a `switch` statement are handled.
 */
export function assertUnreachable(x: never): never {
  throw Fault.create("assert.unreachable")
    .withDescription(`Case not handled: ${String(x)}`, "An unexpected error occurred.")
    .withContext({ value: x })
}

/**
 * Throws an error if a condition is not met.
 */
export function throwUnless(condition: boolean, message: string): asserts condition is true {
  if (!condition) {
    throw Fault.create("assert.condition_failed")
      .withDescription(message, "An unexpected error occurred.")
      .withContext({ condition: "throwUnless" })
  }
}

/**
 * Throws an error if a condition is met.
 */
export function throwIf(condition: boolean, message: string): asserts condition is false {
  if (condition) {
    throw Fault.create("assert.condition_failed")
      .withDescription(message, "An unexpected error occurred.")
      .withContext({ condition: "throwIf" })
  }
}
