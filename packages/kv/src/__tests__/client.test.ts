import { describe, expect, test } from "bun:test"
import { namespaceKey, normalizeKey } from "#client.ts"

describe("normalizeKey", () => {
  test("joins string parts with colons", () => {
    expect(normalizeKey("payments", "customer", "cus_123")).toBe("payments:customer:cus_123")
  })

  test("stringifies number parts", () => {
    expect(normalizeKey("page", 42)).toBe("page:42")
  })

  test("returns a single part as-is", () => {
    expect(normalizeKey("customer")).toBe("customer")
  })
})

describe("namespaceKey", () => {
  test("prefixes keys with the namespace", () => {
    expect(namespaceKey("payments")("customer")).toBe("payments:customer")
  })

  test("composes multiple key parts", () => {
    expect(namespaceKey("payments")("customer", "cus_123", 1)).toBe("payments:customer:cus_123:1")
  })
})
