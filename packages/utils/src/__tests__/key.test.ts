import { describe, expect, it } from "bun:test"
import { key, namespacedKey } from "../key"

describe("key", () => {
  it("should join string arguments with colons", () => {
    const result = key("userId", "123")
    expect(result).toBe("userId:123")
  })

  it("should handle mixed string and number arguments", () => {
    const result = key("userId", 123)
    expect(result).toBe("userId:123")
  })

  it("should handle single argument", () => {
    const result = key("userId")
    expect(result).toBe("userId")
  })

  it("should handle multiple arguments", () => {
    const result = key("user", "profile", "settings", 456)
    expect(result).toBe("user:profile:settings:456")
  })
})

describe("namespacedKey", () => {
  describe("without categories", () => {
    it("should create namespaced keys", () => {
      const createKey = namespacedKey("myNamespace")
      const result = createKey("userId", 123)
      expect(result).toBe("myNamespace:userId:123")
    })

    it("should handle single argument", () => {
      const keys = namespacedKey("api")
      const result = keys("users")
      expect(result).toBe("api:users")
    })

    it("should handle multiple arguments", () => {
      const createKey = namespacedKey("cache")
      const result = createKey("user", "profile", "data", 789)
      expect(result).toBe("cache:user:profile:data:789")
    })
  })

  describe("with categories", () => {
    it("should create keys with predefined categories", () => {
      const createKey = namespacedKey("myNamespace", ["users", "docs"])
      const result = createKey("users", "id", 123)
      expect(result).toBe("myNamespace:users:id:123")
    })

    it("should allow arbitrary strings alongside categories", () => {
      const createKey = namespacedKey("api", ["users", "posts"])
      const result1 = createKey("users", "profile", 123)
      const result2 = createKey("posts", "endpoint")

      expect(result1).toBe("api:users:profile:123")
      expect(result2).toBe("api:posts:endpoint")
    })

    it("should handle numbers with categories", () => {
      const createKey = namespacedKey("db", ["users", "orders"])
      const result = createKey("orders", "item", 42)
      expect(result).toBe("db:orders:item:42")
    })
  })
})
