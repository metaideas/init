import { beforeEach, describe, expect, it, mock } from "bun:test"
import Bun from "bun"
import SuperJSON from "superjson"

type KeyPart = string | number
type Key = string | KeyPart[]

// Mock storage - stores serialized values
const mockStorage = new Map<string, string>()

function keyToString(key: Key): string {
  return typeof key === "string" ? key : key.map(String).join(":")
}

// Mock redis client methods
const mockKv = {
  get: mock((key: Key) => {
    const keyString = keyToString(key)
    const value = mockStorage.get(keyString)
    return value ? SuperJSON.parse(value) : null
  }),
  set: mock((key: Key, value: unknown) => {
    const keyString = keyToString(key)
    mockStorage.set(keyString, SuperJSON.stringify(value))
  }),
  expire: mock((_key: Key, _ttl: number) => {
    // Track expire calls for assertions
  }),
  del: mock((key: Key) => {
    const keyString = keyToString(key)
    mockStorage.delete(keyString)
  }),
  health: mock(() => Promise.resolve(true)),
}

// Mock the redis client module
mock.module("../client", () => ({
  kv: (_namespace?: string, config?: { ttl?: number }) => {
    const defaultTtl = config?.ttl

    const setWithExpire = mock(
      (key: Key, value: unknown, options?: { ex?: number }): Promise<void> => {
        mockKv.set(key, value)
        const ttl = options?.ex ?? defaultTtl
        if (ttl !== undefined) {
          mockKv.expire(key, ttl)
        }
        return Promise.resolve()
      }
    )

    return {
      get: mockKv.get,
      set: setWithExpire,
      expire: mockKv.expire,
      delete: mockKv.del,
      health: mockKv.health,
    }
  },
}))

// Import after mocking - cache depends on kv() which we've mocked
import { cache } from "../cache"

// Test helpers
function createMockFn<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn
) {
  return mock(async (...args: TArgs) => fn(...args))
}

function createCachedFn<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  parts: KeyPart[] = ["test"],
  ttl = 60
) {
  return cache(fn, parts, ttl)
}

describe("cache", () => {
  beforeEach(() => {
    mockStorage.clear()
    mockKv.get.mockClear()
    mockKv.set.mockClear()
    mockKv.expire.mockClear()
    mockKv.del.mockClear()
  })

  describe("basic caching", () => {
    it("should execute function on first call", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn)

      const result = await cached(5)

      expect(result).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(5)
    })

    it("should return cached value on second call", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn)

      const result1 = await cached(5)
      const result2 = await cached(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should store value in redis", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn)

      await cached(5)

      expect(mockKv.set).toHaveBeenCalledTimes(1)
      expect(mockStorage.size).toBe(1)
    })
  })

  describe("cache key generation", () => {
    it("should create different cache keys for different arguments", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn)

      const result1 = await cached(5)
      const result2 = await cached(10)

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
      expect(mockStorage.size).toBe(2)
    })

    it("should use keyParts in cache key", async () => {
      const fn1 = createMockFn((x: number) => x * 2)
      const fn2 = createMockFn((x: number) => x * 3)
      const cached1 = createCachedFn(fn1, ["function1"])
      const cached2 = createCachedFn(fn2, ["function2"])

      await cached1(5)
      await cached2(5)

      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(mockStorage.size).toBe(2)
    })

    it("should handle multiple keyParts", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["namespace", "function", "v1"])

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
      const cached = createCachedFn(fn)

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
      const cached = createCachedFn(fn)

      const [result1, result2] = await Promise.all([cached(5), cached(10)])

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("TTL handling", () => {
    it("should set TTL using expire after set", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn)

      await cached(5)

      expect(mockKv.set).toHaveBeenCalledTimes(1)
      expect(mockKv.expire).toHaveBeenCalledTimes(1)
      const expireCall = mockKv.expire.mock.calls[0]
      expect(expireCall?.[1]).toBe(60)
    })

    it("should use custom TTL when provided", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], 120)

      await cached(5)

      expect(mockKv.set).toHaveBeenCalledTimes(1)
      expect(mockKv.expire).toHaveBeenCalledTimes(1)
      const expireCall = mockKv.expire.mock.calls[0]
      expect(expireCall?.[1]).toBe(120)
    })

    it("should call expire with 0 when TTL is 0", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], 0)

      await cached(5)

      expect(mockKv.set).toHaveBeenCalledTimes(1)
      expect(mockKv.expire).toHaveBeenCalledTimes(1)
      const expireCall = mockKv.expire.mock.calls[0]
      expect(expireCall?.[1]).toBe(0)
    })
  })

  describe("complex types with SuperJSON", () => {
    it("should cache Date objects", async () => {
      const date = new Date("2024-01-01")
      const fn = createMockFn(() => date)
      const cached = createCachedFn(fn)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(date)
      expect(result2).toEqual(date)
      expect(result1).toBeInstanceOf(Date)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache Set objects", async () => {
      const set = new Set([1, 2, 3])
      const fn = createMockFn(() => set)
      const cached = createCachedFn(fn)

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
      const fn = createMockFn(() => map)
      const cached = createCachedFn(fn)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(map)
      expect(result2).toEqual(map)
      expect(result1).toBeInstanceOf(Map)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache undefined", async () => {
      const fn = createMockFn(() => {
        // no-op
      })
      const cached = createCachedFn(fn)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toBeUndefined()
      expect(result2).toBeUndefined()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe("multiple arguments", () => {
    it("should handle functions with multiple arguments", async () => {
      const fn = createMockFn(
        (a: number, b: number, c: string) => `${a + b}${c}`
      )
      const cached = createCachedFn(fn)

      const result = await cached(1, 2, "x")

      expect(result).toBe("3x")
      expect(fn).toHaveBeenCalledWith(1, 2, "x")
    })

    it("should create different keys for different argument combinations", async () => {
      const fn = createMockFn((a: number, b: number) => a + b)
      const cached = createCachedFn(fn)

      await cached(1, 2)
      await cached(2, 1)

      expect(fn).toHaveBeenCalledTimes(2)
      expect(mockStorage.size).toBe(2)
    })

    it("should handle object arguments", async () => {
      const fn = createMockFn((obj: { x: number; y: number }) => obj.x + obj.y)
      const cached = createCachedFn(fn)

      const result1 = await cached({ x: 1, y: 2 })
      const result2 = await cached({ x: 1, y: 2 })

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
