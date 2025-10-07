import { beforeEach, describe, expect, it } from "bun:test"
import { buildFlags } from "../index"
import type { Decision, HookContext, Identity } from "../types"

describe("buildFlags", () => {
  let mockIdentity: Identity
  let mockDecide: (key: string, identity: Identity) => Promise<Decision>

  beforeEach(() => {
    mockIdentity = { distinctId: "user123" }
    mockDecide = async () => ({ value: true })
  })

  describe("basic functionality", () => {
    it("should return default boolean value when decide returns boolean", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: false }),
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: true,
      })
      const result = await betaFeature()

      expect(result).toBe(false)
    })

    it("should return default value when identity is null", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(null),
        decide: mockDecide,
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      const result = await betaFeature()

      expect(result).toBe(false)
    })

    it("should allow 0 as valid distinctId", async () => {
      const createFlag = buildFlags({
        identify: async () => ({ distinctId: 0 }),
        decide: async () => ({ value: true }),
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should call decide function with correct parameters", async () => {
      let calledWith: { key: string; identity: Identity } | undefined

      const createFlag = buildFlags({
        identify: async () => ({ distinctId: "user456" }),
        decide: (key, identity) => {
          calledWith = { key, identity }
          return Promise.resolve({ value: true })
        },
      })

      const betaFeature = createFlag({
        key: "beta-feature",
        defaultValue: false,
      })
      await betaFeature()

      expect(calledWith).toEqual({
        key: "beta-feature",
        identity: { distinctId: "user456" },
      })
    })

    it("should return decide result when available", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      const result = await betaFeature()

      expect(result).toBe(true)
    })
  })

  describe("variant functionality", () => {
    it("should handle variant flags correctly", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ variant: "dark" }),
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })
      const result = await theme()

      expect(result).toBe("dark")
    })

    it("should return default variant when decide fails", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          throw new Error("Service down")
        },
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })
      const result = await theme()

      expect(result).toBe("light")
    })

    it("should return default value when variant doesn't match allowed variants", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ variant: "invalid" }),
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark"],
      })
      const result = await theme()

      // Should return default due to invalid variant error
      expect(result).toBe("light")
    })

    it("should call error hook when variant is invalid", async () => {
      let errorReceived: unknown
      const logs: string[] = []

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ variant: "purple" }),
        hooks: [
          {
            error: (context, error) => {
              errorReceived = error
              const errorMessage =
                error instanceof Error ? error.message : String(error)
              logs.push(`Error in flag "${context.flagKey}": ${errorMessage}`)
            },
          },
        ],
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })
      const result = await theme()

      expect(result).toBe("light")
      expect(errorReceived).toBeDefined()
      expect(logs).toHaveLength(1)
      expect(logs[0]).toContain("Invalid variant")
      expect(logs[0]).toContain("theme")
    })

    it("should work with const arrays for type inference", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ variant: "system" }),
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })
      const result = await theme()

      expect(result).toBe("system")
    })
  })

  describe("override identity", () => {
    it("should use custom identity when provided", async () => {
      let calledWith: Identity | undefined

      const createFlag = buildFlags({
        identify: async () => ({ distinctId: "defaultUser" }),
        decide: (_key, identity) => {
          calledWith = identity
          return Promise.resolve({ value: true })
        },
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature({ distinctId: "customUser" })

      expect(calledWith).toEqual({ distinctId: "customUser" })
    })

    it("should not call identify when custom identity provided", async () => {
      let identifyCalled = false

      const createFlag = buildFlags({
        identify: () => {
          identifyCalled = true
          return Promise.resolve({ distinctId: "defaultUser" })
        },
        decide: async () => ({ value: true }),
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature({ distinctId: "customUser" })

      expect(identifyCalled).toBe(false)
    })

    it("should support additional properties in identity", async () => {
      const customIdentity = {
        distinctId: "user123",
        email: "user@example.com",
        plan: "premium",
      } satisfies Identity

      let receivedIdentity: Identity | undefined

      const createFlag = buildFlags({
        identify: async () => mockIdentity,
        decide: (_key, identity) => {
          receivedIdentity = identity
          return Promise.resolve({ value: true })
        },
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature(customIdentity)

      expect(receivedIdentity).toEqual(customIdentity)
    })
  })

  describe("hooks", () => {
    it("should call before hook", async () => {
      let beforeCalled = false
      let beforeContext: HookContext<Identity> | undefined

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [
          {
            before: (context) => {
              beforeCalled = true
              beforeContext = context
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature()

      expect(beforeCalled).toBe(true)
      expect(beforeContext).toEqual({
        flagKey: "beta",
        identity: mockIdentity,
      })
    })

    it("should call after hook with decision", async () => {
      let afterCalled = false
      let afterContext: HookContext<Identity> | undefined
      let afterDecision: Decision | undefined

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [
          {
            after: (context, decision) => {
              afterCalled = true
              afterContext = context
              afterDecision = decision
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature()

      expect(afterCalled).toBe(true)
      expect(afterContext).toEqual({
        flagKey: "beta",
        identity: mockIdentity,
      })
      expect(afterDecision).toEqual({ value: true })
    })

    it("should call error hook when decide fails", async () => {
      let errorCalled = false
      let errorContext: HookContext<Identity> | undefined
      let errorReceived: unknown

      const testError = new Error("Service down")

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          throw testError
        },
        hooks: [
          {
            error: (context, error) => {
              errorCalled = true
              errorContext = context
              errorReceived = error
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature()

      expect(errorCalled).toBe(true)
      expect(errorContext?.flagKey).toBe("beta")
      expect(errorReceived).toBe(testError)
    })

    it("should call finally hook always", async () => {
      let finallyCalled = 0

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [
          {
            finally: () => {
              finallyCalled++
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })

      await betaFeature()
      expect(finallyCalled).toBe(1)

      await betaFeature()
      expect(finallyCalled).toBe(2)
    })

    it("should call finally hook even when error occurs", async () => {
      let finallyCalled = false

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          throw new Error("Service down")
        },
        hooks: [
          {
            finally: () => {
              finallyCalled = true
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature()

      expect(finallyCalled).toBe(true)
    })

    it("should support multiple hooks", async () => {
      const calls: string[] = []

      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: async () => ({ value: true }),
        hooks: [
          {
            before: () => {
              calls.push("hook1-before")
            },
            after: () => {
              calls.push("hook1-after")
            },
          },
          {
            before: () => {
              calls.push("hook2-before")
            },
            after: () => {
              calls.push("hook2-after")
            },
          },
        ],
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      await betaFeature()

      expect(calls).toEqual([
        "hook1-before",
        "hook2-before",
        "hook1-after",
        "hook2-after",
      ])
    })
  })

  describe("error handling", () => {
    it("should return default value when identify throws", async () => {
      const createFlag = buildFlags({
        identify: () => {
          throw new Error("Identity service down")
        },
        decide: mockDecide,
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: false,
      })
      const result = await betaFeature()

      expect(result).toBe(false)
    })

    it("should return default value when decide throws", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          throw new Error("Feature flag service down")
        },
      })

      const betaFeature = createFlag({
        key: "beta",
        defaultValue: true,
      })
      const result = await betaFeature()

      expect(result).toBe(true)
    })

    it("should handle error in variant flags", async () => {
      const createFlag = buildFlags({
        identify: () => Promise.resolve(mockIdentity),
        decide: () => {
          throw new Error("Service down")
        },
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark"],
      })
      const result = await theme()

      expect(result).toBe("light")
    })
  })

  describe("integration scenarios", () => {
    it("should work end-to-end with all features", async () => {
      const calls: string[] = []
      let errorCalled = false

      const createFlag = buildFlags({
        identify: async () => ({ distinctId: "user789", plan: "premium" }),
        decide: (key, identity) => {
          if (key === "premium" && identity.distinctId === "user789") {
            return Promise.resolve({ value: true })
          }
          return Promise.resolve({ value: false })
        },
        hooks: [
          {
            before: (context) => {
              calls.push(`before:${context.flagKey}`)
            },
            after: (context) => {
              calls.push(`after:${context.flagKey}`)
            },
            error: () => {
              errorCalled = true
            },
          },
        ],
      })

      const premiumFeature = createFlag({
        key: "premium",
        defaultValue: false,
      })
      const basicFeature = createFlag({
        key: "basic",
        defaultValue: true,
      })

      // Test normal operation
      const premiumResult = await premiumFeature()
      expect(premiumResult).toBe(true)

      // Test override identity
      const customIdentityResult = await basicFeature({
        distinctId: "different-user",
        plan: "basic",
      })
      expect(customIdentityResult).toBe(false)

      // Test hooks were called
      expect(calls).toEqual([
        "before:premium",
        "after:premium",
        "before:basic",
        "after:basic",
      ])

      // No errors should have occurred
      expect(errorCalled).toBe(false)
    })

    it("should work with variant flags end-to-end", async () => {
      const createFlag = buildFlags({
        identify: async () => ({
          distinctId: "user123",
          preferences: { theme: "dark" },
        }),
        decide: (key, identity) => {
          if (key === "theme" && identity.preferences?.theme) {
            return Promise.resolve({
              variant: identity.preferences.theme as string,
            })
          }
          return Promise.resolve({ variant: "light" })
        },
      })

      const theme = createFlag({
        key: "theme",
        defaultValue: "light",
        variants: ["light", "dark", "system"],
      })

      const result = await theme()
      expect(result).toBe("dark")

      // Test with override
      const overrideResult = await theme({
        distinctId: "user456",
        preferences: { theme: "system" },
      })
      expect(overrideResult).toBe("system")
    })
  })
})
