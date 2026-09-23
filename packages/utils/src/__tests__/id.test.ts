import { describe, expect, test } from "bun:test"
import { createIdGenerator } from "#id.ts"

const ID_REGEX = /^[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]+$/
const ID_REGEX_WITH_PREFIX = /^test_[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]+$/

describe("createIdGenerator", () => {
  test("generates an id with the specified size", () => {
    const sizes = [8, 12, 16, 24, 32]

    sizes.forEach((size) => {
      const generateId = createIdGenerator({ size })
      const id = generateId()
      expect(id).toHaveLength(size)
      expect(id).toMatch(ID_REGEX)
    })
  })

  test("generates a prefixed id", () => {
    const generateId = createIdGenerator({ prefix: "test", size: 12 })
    const id = generateId()
    expect(id).toMatch(ID_REGEX_WITH_PREFIX)
    expect(id).toHaveLength("test_".length + 12)
  })
})
