import { customAlphabet } from "nanoid"

// Custom alphabet with non lookalike characters
const nanoid = customAlphabet(
  // biome-ignore lint/nursery/noSecrets: This is a custom alphabet
  "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz"
)

export function generateNoLookalikeId(size = 24) {
  return nanoid(size)
}
