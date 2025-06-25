import type { FirstArg, JoinedRest, RestArgs } from "./type"

type KeyFormat<
  T extends string,
  Args extends string[],
> = `${T}:${FirstArg<Args>}${JoinedRest<RestArgs<Args>>}`

export function buildKeyGenerator<
  const TopKey extends string,
  const SubKeys extends string,
>(): <C extends TopKey, Args extends [SubKeys, ...string[]]>(
  category: C,
  ...args: Args
) => KeyFormat<C, Args> {
  return <C extends TopKey, Args extends [SubKeys, ...string[]]>(
    category: C,
    ...args: Args
  ): KeyFormat<C, Args> => {
    return [category, ...args].join(":") as KeyFormat<C, Args>
  }
}

export class LRU<Key extends PropertyKey, Value = unknown> {
  #capacity: number
  #cache: Map<Key, Value>

  constructor(capacity: number) {
    this.#capacity = capacity
    this.#cache = new Map()
  }

  #setMostRecentlyUsed(key: Key, value: Value) {
    this.#cache.delete(key)
    this.#cache.set(key, value)
  }

  get(key: Key): Value | undefined {
    const value = this.#cache.get(key)

    if (value === undefined) {
      return undefined
    }

    this.#setMostRecentlyUsed(key, value)

    return value
  }

  set(key: Key, value: Value) {
    this.#setMostRecentlyUsed(key, value)

    if (this.#cache.size > this.#capacity) {
      const oldestKey = this.#cache.keys().next().value
      if (oldestKey !== undefined) {
        this.#cache.delete(oldestKey)
      }
    }
  }

  delete(key: Key) {
    this.#cache.delete(key)
  }
}
