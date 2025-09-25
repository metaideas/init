import { beforeEach, describe, expect, it } from "bun:test"
import type { CustomError } from "@init/utils/error"
import { flags } from "../index"

describe("flags", () => {
  let mockCache: Map<string, boolean>
  let mockIdentify: () => Promise<string>
  let mockDecide: (
    key: string,
    identity: string | number
  ) => Promise<boolean | undefined>

  beforeEach(() => {
    mockCache = new Map<string, boolean>()
    mockIdentify = async () => "user123"
    mockDecide = async () => true
  })

  describe("basic functionality", () => {
    it("should return default value when identity is null", async () => {
      const flag = flags({
        identify: () => Promise.resolve(undefined),
        decide: mockDecide,
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(false)
    })

    it("should return default value when identity is undefined", async () => {
      const flag = flags({
        identify: () => Promise.resolve(undefined),
        decide: mockDecide,
      })

      const betaFeature = flag("beta", true)
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should allow 0 as valid identity", async () => {
      const flag = flags({
        identify: async () => 0,
        decide: async () => true,
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should call decide function with correct parameters", async () => {
      let calledWith: { key: string; identity: string | number } | undefined

      const flag = flags({
        identify: async () => "user456",
        decide: (key, identity) => {
          calledWith = { key, identity }
          return Promise.resolve(true)
        },
      })

      const betaFeature = flag("beta-feature", false)
      await betaFeature()

      expect(calledWith).toEqual({
        key: "beta-feature",
        identity: "user456",
      })
    })

    it("should return decide result when available", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: async () => true,
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should fallback to default when decide returns undefined", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: () => Promise.resolve(undefined),
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(false)
    })
  })

  describe("override functionality", () => {
    it("should return override value when provided", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: async () => false,
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature({ override: true })

      expect(result).toBe(true)
    })

    it("should return override false even when decide would return true", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: async () => true,
      })

      const betaFeature = flag("beta", true)
      const result = await betaFeature({ override: false })

      expect(result).toBe(false)
    })

    it("should use custom identity when provided", async () => {
      let calledWith: string | number | undefined

      const flag = flags({
        identify: async () => "defaultUser",
        decide: (_key, identity) => {
          calledWith = identity
          return Promise.resolve(true)
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature({ identity: "customUser" })

      expect(calledWith).toBe("customUser")
    })

    it("should not call identify when custom identity provided", async () => {
      let identifyCalled = false

      const flag = flags({
        identify: () => {
          identifyCalled = true
          return Promise.resolve("defaultUser")
        },
        decide: mockDecide,
      })

      const betaFeature = flag("beta", false)
      await betaFeature({ identity: "customUser" })

      expect(identifyCalled).toBe(false)
    })
  })

  describe("caching", () => {
    it("should return cached value when available", async () => {
      let decideCallCount = 0

      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          decideCallCount++
          return Promise.resolve(true)
        },
        cache: {
          get: (key) => mockCache.get(key),
          set: (key, value) => {
            mockCache.set(key, value)
          },
        },
      })

      // Set cache value
      mockCache.set("flag:beta:user123", false)

      const betaFeature = flag("beta", true)
      const result = await betaFeature()

      expect(result).toBe(false)
      expect(decideCallCount).toBe(0)
    })

    it("should cache the result after decide call", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: async () => true,
        cache: {
          get: (key) => mockCache.get(key),
          set: (key, value) => {
            mockCache.set(key, value)
          },
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature()

      expect(mockCache.get("flag:beta:user123")).toBe(true)
    })

    it("should cache default value when decide returns undefined", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: () => Promise.resolve(undefined),
        cache: {
          get: (key) => mockCache.get(key),
          set: (key, value) => {
            mockCache.set(key, value)
          },
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature()

      expect(mockCache.get("flag:beta:user123")).toBe(false)
    })

    it("should handle cached false values correctly", async () => {
      let decideCallCount = 0

      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          decideCallCount++
          return Promise.resolve(true)
        },
        cache: {
          get: (key) => mockCache.get(key),
          set: (key, value) => {
            mockCache.set(key, value)
          },
        },
      })

      // Explicitly cache false
      mockCache.set("flag:beta:user123", false)

      const betaFeature = flag("beta", true)
      const result = await betaFeature()

      expect(result).toBe(false)
      expect(decideCallCount).toBe(0)
    })

    it("should work with async cache operations", async () => {
      const asyncCache = new Map<string, boolean>()

      const flag = flags({
        identify: mockIdentify,
        decide: async () => true,
        cache: {
          get: async (key) => asyncCache.get(key),
          set: (key, value) => {
            asyncCache.set(key, value)
          },
        },
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(true)
      expect(asyncCache.get("flag:beta:user123")).toBe(true)
    })
  })

  describe("error handling", () => {
    it("should return default value when identify throws", async () => {
      const flag = flags({
        identify: () => {
          throw new Error("Identity service down")
        },
        decide: mockDecide,
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      expect(result).toBe(false)
    })

    it("should return default value when decide throws", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          throw new Error("Feature flag service down")
        },
      })

      const betaFeature = flag("beta", true)
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should call onError when provided", async () => {
      let errorReceived: CustomError | undefined

      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          throw new Error("Service error")
        },
        onError: (error) => {
          errorReceived = error
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature()

      expect(errorReceived?.name).toBe("FlagError")
      expect(errorReceived?.message).toBe("Service error")
      expect(errorReceived?.context).toEqual({
        key: "beta",
        identity: "user123",
      })
    })

    it("should wrap errors in FlagError in onError", async () => {
      let errorReceived: CustomError | undefined
      const originalError = new Error("Original error")
      originalError.stack = "original stack trace"

      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          throw originalError
        },
        onError: (error) => {
          errorReceived = error
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature()

      expect(errorReceived?.name).toBe("FlagError")
      expect(errorReceived?.message).toBe("Original error")
      expect(errorReceived?.context).toEqual({
        key: "beta",
        identity: "user123",
      })
    })

    it("should handle Error objects in FlagError", async () => {
      let errorReceived: CustomError | undefined

      const flag = flags({
        identify: mockIdentify,
        decide: () => {
          throw new Error("String error")
        },
        onError: (error) => {
          errorReceived = error
        },
      })

      const betaFeature = flag("beta", false)
      await betaFeature()

      expect(errorReceived?.name).toBe("FlagError")
      expect(errorReceived?.message).toBe("String error")
      expect(errorReceived?.context).toEqual({
        key: "beta",
        identity: "user123",
      })
    })

    it("should handle cache errors gracefully", async () => {
      const flag = flags({
        identify: mockIdentify,
        decide: async () => true,
        cache: {
          get: () => {
            throw new Error("Cache read error")
          },
          set: () => {
            throw new Error("Cache write error")
          },
        },
      })

      const betaFeature = flag("beta", false)
      const result = await betaFeature()

      // Should still work despite cache errors
      expect(result).toBe(false) // Returns default due to error
    })
  })

  describe("integration scenarios", () => {
    it("should work end-to-end with all features", async () => {
      let onErrorCalled = false

      const flag = flags({
        identify: async () => "user789",
        decide: (key, identity) => {
          if (key === "premium" && identity === "user789") {
            return Promise.resolve(true)
          }
          return Promise.resolve(false)
        },
        cache: {
          get: (key) => mockCache.get(key),
          set: (key, value) => {
            mockCache.set(key, value)
          },
        },
        onError: () => {
          onErrorCalled = true
        },
      })

      const premiumFeature = flag("premium", false)
      const basicFeature = flag("basic", true)

      // Test normal operation
      const premiumResult = await premiumFeature()
      expect(premiumResult).toBe(true)

      // Test caching
      const cachedResult = await premiumFeature()
      expect(cachedResult).toBe(true)
      expect(mockCache.get("flag:premium:user789")).toBe(true)

      // Test override
      const overrideResult = await premiumFeature({ override: false })
      expect(overrideResult).toBe(false)

      // Test custom identity
      const customIdentityResult = await basicFeature({
        identity: "different-user",
      })
      expect(customIdentityResult).toBe(false)

      // No errors should have occurred
      expect(onErrorCalled).toBe(false)
    })
  })
})
