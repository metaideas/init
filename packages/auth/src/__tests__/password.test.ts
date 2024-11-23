import { InternalError } from "@this/common/errors"
import { describe, expect, it } from "vitest"
import { hashPassword, verifyPassword } from "#password.ts"

const HASH_STRING_REGEX = /^\$scrypt\$N=\d+,r=\d+,p=\d+\$[a-f0-9]+\$[a-f0-9]+$/

describe("password", () => {
  describe("hashPassword", () => {
    it("should generate a valid hash string", () => {
      const password = "test-password"
      const hash = hashPassword(password)

      expect(hash).toMatch(HASH_STRING_REGEX)
    })

    it("should generate different hashes for the same password", () => {
      const password = "test-password"
      const hash1 = hashPassword(password)
      const hash2 = hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should verify a correct password", () => {
      const password = "test-password"
      const hash = hashPassword(password)

      expect(verifyPassword(password, hash)).toBe(true)
    })

    it("should reject an incorrect password", () => {
      const password = "test-password"
      const hash = hashPassword(password)

      expect(verifyPassword("wrong-password", hash)).toBe(false)
    })

    it("should reject an invalid hash string", () => {
      const password = "test-password"

      expect(() => verifyPassword(password, "invalid-hash")).toThrow(
        InternalError
      )
      // biome-ignore lint/nursery/noSecrets: This is a test string
      expect(() => verifyPassword(password, "$invalid$N=1$salt$hash")).toThrow(
        InternalError
      )
    })

    it("should reject a hash with wrong algorithm", () => {
      const password = "test-password"
      const hash = hashPassword(password).replace("scrypt", "bcrypt")

      expect(() => verifyPassword(password, hash)).toThrow(InternalError)
    })
  })
})
