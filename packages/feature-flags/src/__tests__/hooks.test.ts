import { beforeEach, describe, expect, it } from "bun:test"
import type { Cache } from "../hook"
import { CacheHook } from "../hook"
import { buildFlags } from "../index"
import type { Decision, Identity } from "../types"

describe("hooks", () => {
  describe("CacheHook", () => {
    let mockIdentity: Identity
    let mockCache: Map<string, Decision>
    let cache: Cache

    beforeEach(() => {
      mockIdentity = { distinctId: "user123" }
      mockCache = new Map()
      cache = {
        get: (key: string) => Promise.resolve(mockCache.get(key)),
        set: (key: string, value: Decision) => {
          mockCache.set(key, value)
          return Promise.resolve()
        },
      }
    })

    it("should cache boolean flag results", async () => {
      let decideCalls = 0

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          decideCalls++
          return Promise.resolve({ value: true })
        },
        hooks: [new CacheHook(cache)],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      // First call - should call decide
      const result1 = await betaFeature()
      expect(result1).toBe(true)
      expect(decideCalls).toBe(1)

      // Second call - should use cache
      const result2 = await betaFeature()
      expect(result2).toBe(true)
      expect(decideCalls).toBe(1) // Should not call decide again
    })

    it("should cache variant flag results", async () => {
      let decideCalls = 0

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          decideCalls++
          return Promise.resolve({ variant: "dark" })
        },
        hooks: [new CacheHook(cache)],
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })

      // First call - should call decide
      const result1 = await theme()
      expect(result1).toBe("dark")
      expect(decideCalls).toBe(1)

      // Second call - should use cache
      const result2 = await theme()
      expect(result2).toBe("dark")
      expect(decideCalls).toBe(1)
    })

    it("should use different cache keys for different flags", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: (key) => {
          if (key === "feature1") {
            return Promise.resolve({ value: true })
          }
          return Promise.resolve({ value: false })
        },
        hooks: [new CacheHook(cache)],
      })

      const feature1 = createFlag({
        key: "feature1",
        defaultValue: false,
      })

      const feature2 = createFlag({
        key: "feature2",
        defaultValue: true,
      })

      const result1 = await feature1()
      const result2 = await feature2()

      expect(result1).toBe(true)
      expect(result2).toBe(false)

      // Check that both are cached separately
      expect(mockCache.size).toBe(2)
      expect(mockCache.get("feature1:user123")).toEqual({ value: true })
      expect(mockCache.get("feature2:user123")).toEqual({ value: false })
    })

    it("should use different cache keys for different identities", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [new CacheHook(cache)],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      // Call with default identity
      await betaFeature()

      // Call with different identity
      await betaFeature({ distinctId: "user456" })

      // Should have two cache entries
      expect(mockCache.size).toBe(2)
      expect(mockCache.get("beta:user123")).toEqual({ value: true })
      expect(mockCache.get("beta:user456")).toEqual({ value: true })
    })

    it("should not cache when identity is null", async () => {
      let decideCalls = 0

      const createFlag = buildFlags({
        identify: () => Promise.resolve(null),
        decide: () => {
          decideCalls++
          return Promise.resolve({ value: true })
        },
        hooks: [new CacheHook(cache)],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      // First call
      await betaFeature()
      expect(decideCalls).toBe(0) // decide won't be called due to null identity

      // Second call
      await betaFeature()
      expect(decideCalls).toBe(0)

      // Cache should be empty
      expect(mockCache.size).toBe(0)
    })

    it("should work with multiple hooks", async () => {
      const calls: string[] = []

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [
          {
            before: () => {
              calls.push("before")
            },
            after: () => {
              calls.push("after")
            },
          },
          new CacheHook(cache),
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      // First call - not cached
      await betaFeature()
      expect(calls).toEqual(["before", "after"])

      calls.length = 0

      // Second call - cached, should skip decide and after hooks
      await betaFeature()
      expect(calls).toEqual(["before"])
    })

    it("should handle cache errors gracefully", async () => {
      const failingCache: Cache = {
        get: () => {
          throw new Error("Cache read failed")
        },
        set: () => {
          throw new Error("Cache write failed")
        },
      }

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [new CacheHook(failingCache)],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      // Should still work despite cache errors - decide function still runs
      const result = await betaFeature()
      expect(result).toBe(true)
    })

    it("should cache the actual decision, not the default value", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: false }),
        hooks: [new CacheHook(cache)],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: true,
      })

      const result = await betaFeature()
      expect(result).toBe(false)

      // Check cache contains the decision, not the default
      expect(mockCache.get("beta:user123")).toEqual({ value: false })
    })
  })
})
