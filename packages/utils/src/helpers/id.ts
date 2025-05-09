import { customAlphabet } from "nanoid"

// Custom alphabet with non lookalike characters
const nanoid = customAlphabet(
  "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz"
)

export function generateNoLookalikeId(size = 24) {
  return nanoid(size)
}

export function generatePrefixedId(prefix: string, size = 24) {
  return `${prefix}_${generateNoLookalikeId(size)}`
}
