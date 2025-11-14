import { beforeEach, describe, expect, it, mock } from "bun:test"
import Bun from "bun"
import type { Driver, StorageValue } from "unstorage"
import { cache } from "../cache"

// Simple in-memory driver for testing
function createMemoryDriver(): Driver {
  const storage = new Map<string, unknown>()

  return {
    hasItem: (key: string) => Promise.resolve(storage.has(key)),
    getItem: (key: string) =>
      Promise.resolve((storage.get(key) ?? null) as StorageValue),
    setItem: (key: string, value: string) => {
      storage.set(key, value)
      return Promise.resolve()
    },
    removeItem: (key: string) => {
      storage.delete(key)
      return Promise.resolve()
    },
    getKeys: (base: string) => {
      const keys = Array.from(storage.keys())
      if (!base) {
        return Promise.resolve(keys)
      }
      return Promise.resolve(keys.filter((k) => k.startsWith(base)))
    },
    clear: () => {
      storage.clear()
      return Promise.resolve()
    },
  }
}

// Test helpers
function createMockFn<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn
) {
  return mock(async (...args: TArgs) => fn(...args))
}

function createCachedFn<TArgs extends unknown[], TReturn extends StorageValue>(
  fn: (...args: TArgs) => Promise<TReturn>,
  parts: (string | number)[] = ["test"],
  driver?: Driver
) {
  return cache(fn, parts, driver)
}

describe("cache", () => {
  let driver: Driver

  beforeEach(() => {
    driver = createMemoryDriver()
  })

  describe("basic caching", () => {
    it("should execute function on first call", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], driver)

      const result = await cached(5)

      expect(result).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(5)
    })

    it("should return cached value on second call", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached(5)
      const result2 = await cached(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should store value in storage", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], driver)

      await cached(5)

      const keys = await driver.getKeys("", {})
      expect(keys.length).toBe(1)
    })
  })

  describe("cache key generation", () => {
    it("should create different cache keys for different arguments", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached(5)
      const result2 = await cached(10)

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
      const keys = await driver.getKeys("", {})
      expect(keys.length).toBe(2)
    })

    it("should use keyParts in cache key", async () => {
      const fn1 = createMockFn((x: number) => x * 2)
      const fn2 = createMockFn((x: number) => x * 3)
      const cached1 = createCachedFn(fn1, ["function1"], driver)
      const cached2 = createCachedFn(fn2, ["function2"], driver)

      await cached1(5)
      await cached2(5)

      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      const keys = await driver.getKeys("", {})
      expect(keys.length).toBe(2)
    })

    it("should handle multiple keyParts", async () => {
      const fn = createMockFn((x: number) => x * 2)
      const cached = createCachedFn(fn, ["namespace", "function", "v1"], driver)

      await cached(5)

      const keys = await driver.getKeys("", {})
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
      const cached = createCachedFn(fn, ["test"], driver)

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
      const cached = createCachedFn(fn, ["test"], driver)

      const [result1, result2] = await Promise.all([cached(5), cached(10)])

      expect(result1).toBe(10)
      expect(result2).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe("complex types", () => {
    it("should cache objects", async () => {
      const obj = { a: 1, b: 2 }
      const fn = createMockFn(() => obj)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(obj)
      expect(result2).toEqual(obj)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache arrays", async () => {
      const arr = [1, 2, 3]
      const fn = createMockFn(() => arr)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toEqual(arr)
      expect(result2).toEqual(arr)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should cache boolean values", async () => {
      const fn = createMockFn(() => true)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached()
      const result2 = await cached()

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe("multiple arguments", () => {
    it("should handle functions with multiple arguments", async () => {
      const fn = createMockFn(
        (a: number, b: number, c: string) => `${a + b}${c}`
      )
      const cached = createCachedFn(fn, ["test"], driver)

      const result = await cached(1, 2, "x")

      expect(result).toBe("3x")
      expect(fn).toHaveBeenCalledWith(1, 2, "x")
    })

    it("should create different keys for different argument combinations", async () => {
      const fn = createMockFn((a: number, b: number) => a + b)
      const cached = createCachedFn(fn, ["test"], driver)

      await cached(1, 2)
      await cached(2, 1)

      expect(fn).toHaveBeenCalledTimes(2)
      const keys = await driver.getKeys("", {})
      expect(keys.length).toBe(2)
    })

    it("should handle object arguments", async () => {
      const fn = createMockFn((obj: { x: number; y: number }) => obj.x + obj.y)
      const cached = createCachedFn(fn, ["test"], driver)

      const result1 = await cached({ x: 1, y: 2 })
      const result2 = await cached({ x: 1, y: 2 })

      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
