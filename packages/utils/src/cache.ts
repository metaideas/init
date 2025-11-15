import { createStorage, type Driver, type StorageValue } from "unstorage"
import { stableSerialize } from "./serialize"

/**
 * Creates a function wrapped in a cache. You can pass a custom driver to use a
 * different storage backend.
 *
 * @example
 * const cachedFn = cache(myFn, ["my-key"], )
 *
 * await cachedFn(1, 2, 3) // Arguments are serialized and used as parts of the cache key
 * await cachedFn(1, 2, 3) // Returns the cached value
 */
export function cache<A extends unknown[], R extends StorageValue>(
  fn: (...args: A) => Promise<R>,
  parts: (string | number)[],
  driver?: Driver
): (...args: A) => Promise<R> {
  const storage = createStorage({ driver })

  // In-flight deduplication map (always local, per-function instance)
  const inflight = new Map<string, Promise<R>>()

  return async function wrapped(...args: A): Promise<R> {
    const serializedArgs = args.map(stableSerialize)
    const cacheKey = [...parts, ...serializedArgs].map(String).join(":")

    // Check in-flight requests
    const existing = inflight.get(cacheKey)
    if (existing) {
      return existing
    }

    // Check cache store
    const cached = await storage.getItem<R>(cacheKey)

    // If we have the value cached, return it
    if (cached !== null) {
      return cached
    }

    // Execute and cache
    const promise = (async () => {
      try {
        const value = await fn(...args)
        await storage.setItem(cacheKey, value)
        return value
      } finally {
        inflight.delete(cacheKey)
      }
    })()

    inflight.set(cacheKey, promise)
    return promise
  }
}
