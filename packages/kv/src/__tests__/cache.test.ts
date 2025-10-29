import { beforeEach, describe, expect, it, mock } from "bun:test"
import Bun from "bun"

// Mock storage
const mockStorage = new Map<string, string>()
const mockTTLs = new Map<string, number>()

// Mock redis client
const mockRedis = {
  get: mock((key: string) => mockStorage.get(key) ?? null),
  set: mock(
    (key: string, value: string, options?: Partial<SetCommandOptions>) => {
      mockStorage.set(key, value)
      if (options?.ex) {
        mockTTLs.set(key, options.ex)
      }
      return "OK"
    }
  ),
}

// Mock the redis client module
mock.module("../client", () => ({
  redis: () => mockRedis,
}))

// Import after mocking
import type { SetCommandOptions } from "@upstash/redis"
import { cache } from "../cache"

describe("cache", () => {
  beforeEach(() => {
    mockStorage.clear()
    mockTTLs.clear()
    mockRedis.get.mockClear()
    mockRedis.set.mockClear()
  })

  describe("basic caching", () => {
    it("should execute function on first call", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"])

      const result = await cached(5)

      expect(result).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(5)
    })

    it("should return cached value on second call", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"])

      const result1 = await cached(5)
      const result2 = await cached(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should store value in redis", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"])

      await cached(5)

      expect(mockRedis.set).toHaveBeenCalledTimes(1)
      expect(mockStorage.size).toBe(1)
    })
  })

  describe("cache key generation", () => {
    it("should create different cache keys for different arguments", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"])

      const result1 = await cached(5)
      const result2 = await cached(10)

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(mockStorage.size).toBe(2)
    })

    it("should use keyParts in cache key", async () => {
      const fn1 = mock(async (x: number) => x * 2)
      const fn2 = mock(async (x: number) => x * 3)
      const cached1 = cache(fn1, ["function1"])
      const cached2 = cache(fn2, ["function2"])

      await cached1(5)
      await cached2(5)

      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(mockStorage.size).toBe(2)
    })

    it("should handle multiple keyParts", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["namespace", "function", "v1"])

      await cached(5)

      const keys = Array.from(mockStorage.keys())
      expect(keys[0]).toContain("namespace")
      expect(keys[0]).toContain("function")
      expect(keys[0]).toContain("v1")
    })
  })

  describe("in-flight deduplication", () => {
    it("should deduplicate sequential calls before cache write completes", async () => {
      let callCount = 0
      const fn = mock(async (x: number) => {
        callCount++
        await Bun.sleep(50)
        return x * 2
      })
      const cached = cache(fn, ["test"])

      // Start first call but don't await yet
      const promise1 = cached(5)

      // Wait a bit to ensure first call has started
      await Bun.sleep(5)

      // Start second call while first is still running
      const promise2 = cached(5)

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(callCount).toBe(1)
    })

    it("should not deduplicate calls with different arguments", async () => {
      const fn = mock(async (x: number) => {
        await Bun.sleep(10)
        return x * 2
      })
      const cached = cache(fn, ["test"])

      const [result1, result2] = await Promise.all([cached(5), cached(10)])

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("TTL handling", () => {
    it("should pass TTL to redis set command", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"], { ttl: 60_000 })

      await cached(5)

      expect(mockRedis.set).toHaveBeenCalledTimes(1)
      const [, , options] = mockRedis.set.mock.calls[0] as [
        string,
        string,
        Partial<SetCommandOptions>?,
      ]
      expect(options).toEqual({ ex: 60 })
      const key = Array.from(mockStorage.keys())[0] ?? ""
      expect(key).toBeDefined()
      expect(mockTTLs.get(key)).toBe(60)
    })

    it("should convert milliseconds to seconds", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"], { ttl: 5000 })

      await cached(5)

      const [, , options] = mockRedis.set.mock.calls[0] as [
        string,
        string,
        Partial<SetCommandOptions>?,
      ]
      expect(options).toEqual({ ex: 5 })
    })

    it("should not set TTL when not provided", async () => {
      const fn = mock(async (x: number) => x * 2)
      const cached = cache(fn, ["test"])

      await cached(5)

      const [, , options] = mockRedis.set.mock.calls[0] as [
        string,
        string,
        Partial<SetCommandOptions>?,
      ]
      expect(options).toEqual({})
    })
  })

  describe("complex types with SuperJSON", () => {
    it("should cache Date objects", async () => {
      const date = new Date("2024-01-01")
      const fn = mock(async () => date)
      const cached = cache(fn, ["test"])

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(date)
      expect(result2).toEqual(date)
      expect(result1).toBeInstanceOf(Date)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache Set objects", async () => {
      const set = new Set([1, 2, 3])
      const fn = mock(async () => set)
      const cached = cache(fn, ["test"])

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(set)
      expect(result2).toEqual(set)
      expect(result1).toBeInstanceOf(Set)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache Map objects", async () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
      ])
      const fn = mock(async () => map)
      const cached = cache(fn, ["test"])

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(map)
      expect(result2).toEqual(map)
      expect(result1).toBeInstanceOf(Map)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache undefined", async () => {
      const fn = mock(async () => {
        // no-op
      })
      const cached = cache(fn, ["test"])

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toBeUndefined()
      expect(result2).toBeUndefined()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe("multiple arguments", () => {
    it("should handle functions with multiple arguments", async () => {
      const fn = mock(async (a: number, b: number, c: string) => `${a + b}${c}`)
      const cached = cache(fn, ["test"])

      const result = await cached(1, 2, "x")

      expect(result).toBe("3x")
      expect(fn).toHaveBeenCalledWith(1, 2, "x")
    })

    it("should create different keys for different argument combinations", async () => {
      const fn = mock(async (a: number, b: number) => a + b)
      const cached = cache(fn, ["test"])

      await cached(1, 2)
      await cached(2, 1)

      expect(fn).toHaveBeenCalledTimes(2)
      expect(mockStorage.size).toBe(2)
    })

    it("should handle object arguments", async () => {
      const fn = mock(async (obj: { x: number; y: number }) => obj.x + obj.y)
      const cached = cache(fn, ["test"])

      const result1 = await cached({ x: 1, y: 2 })
      const result2 = await cached({ x: 1, y: 2 })

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
