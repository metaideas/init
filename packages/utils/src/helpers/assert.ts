/**
 * Asserts that a value is never, and throws an error if it is. Use this to make
 * sure that all cases in a `switch` statement are handled.
 */
export function assertUnreachable(x: never): never {
  throw new Error(`Case not handled: ${x}`)
}
