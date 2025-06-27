import { describe, expect, it } from "bun:test"
import { generateNoLookalikeId, generatePrefixedId } from "../id"

const ID_REGEX = /^[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]+$/
const ID_REGEX_WITH_PREFIX_AND_SIZE_24 =
  /^test_[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]{24}$/
const ID_REGEX_WITH_PREFIX_AND_SIZE_12 =
  /^test_[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]{12}$/
const ID_REGEX_WITH_PREFIX_AND_SIZE_12_EMPTY_PREFIX =
  /^_[346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz]{12}$/

describe("id", () => {
  describe("generateNoLookalikeId", () => {
    it("should generate an id with default size of 24", () => {
      const id = generateNoLookalikeId()
      expect(id).toHaveLength(24)
    })

    it("should generate an id with custom size", () => {
      const id = generateNoLookalikeId(12)
      expect(id).toHaveLength(12)
    })

    it("should only use non-lookalike characters", () => {
      const id = generateNoLookalikeId()
      expect(id).toMatch(ID_REGEX)
    })
  })

  describe("generatePrefixedId", () => {
    it("should generate a prefixed id with default size", () => {
      const id = generatePrefixedId("test")
      expect(id).toMatch(ID_REGEX_WITH_PREFIX_AND_SIZE_24)
    })

    it("should generate a prefixed id with custom size", () => {
      const id = generatePrefixedId("test", 12)
      expect(id).toMatch(ID_REGEX_WITH_PREFIX_AND_SIZE_12)
    })

    it("should handle empty prefix", () => {
      const id = generatePrefixedId("", 12)
      expect(id).toMatch(ID_REGEX_WITH_PREFIX_AND_SIZE_12_EMPTY_PREFIX)
    })
  })
})
