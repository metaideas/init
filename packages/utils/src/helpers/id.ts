import { customAlphabet } from "nanoid"

const NO_LOOKALIKE_ALPHABET =
  "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz"

// Custom alphabet with non lookalike characters
const nanoid = customAlphabet(NO_LOOKALIKE_ALPHABET)

export function generateNoLookalikeId(size = 24) {
  return nanoid(size)
}

export function generatePrefixedId(prefix: string, size = 24) {
  return `${prefix}_${generateNoLookalikeId(size)}`
}
