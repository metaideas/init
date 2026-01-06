import { customAlphabet } from "nanoid"

const NO_LOOKALIKE_ALPHABET = "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz"

// Custom alphabet with non lookalike characters
const nanoid = customAlphabet(NO_LOOKALIKE_ALPHABET)

const DEFAULT_OPTIONS = { size: 24 } as const

export function createIdGenerator({
  prefix,
  size,
}: {
  prefix?: string
  size: number
} = DEFAULT_OPTIONS) {
  return () => {
    if (prefix) {
      return `${prefix}_${nanoid(size)}`
    }

    return nanoid(size)
  }
}
