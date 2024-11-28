import { InternalError } from "@this/common/errors"
import { describe, expect, it } from "vitest"
import { hashPassword, verifyPassword } from "#utils/password.ts"

const HASH_STRING_REGEX = /^\$scrypt\$N=\d+,r=\d+,p=\d+\$[a-f0-9]+\$[a-f0-9]+$/

describe("password", () => {
  describe("hashPassword", () => {
    it("should generate a valid hash string", async () => {
      const password = "test-password"
      const hash = await hashPassword(password)

      expect(hash).toMatch(HASH_STRING_REGEX)
    })

    it("should generate different hashes for the same password", async () => {
      const password = "test-password"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const password = "test-password"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it("should reject an incorrect password", async () => {
      const password = "test-password"
      const hash = await hashPassword(password)
      const isValid = await verifyPassword("wrong-password", hash)

      expect(isValid).toBe(false)
    })

    it("should reject an invalid hash string", async () => {
      const password = "test-password"

      await expect(
        async () => await verifyPassword(password, "invalid-hash")
      ).rejects.toThrow(InternalError)
      await expect(async () => {
        // biome-ignore lint/nursery/noSecrets: This is a test string
        await verifyPassword(password, "$invalid$N=1$salt$hash")
      }).rejects.toThrow(InternalError)
    })

    it("should reject a hash with wrong algorithm", async () => {
      const password = "test-password"
      const hash = (await hashPassword(password)).replace("scrypt", "bcrypt")

      await expect(
        async () => await verifyPassword(password, hash)
      ).rejects.toThrow(InternalError)
    })
  })
})
