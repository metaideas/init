import { key } from "@init/utils/key"
import type { Decision, Hook, HookContext, Identity } from "./types"

export interface Cache {
  get: (key: string) => Promise<Decision | undefined>
  set: (key: string, value: Decision) => Promise<void>
}

export class CacheHook<T extends Identity> implements Hook<T> {
  #cache: Cache

  constructor(cache: Cache) {
    this.#cache = cache
  }

  async resolve(context: HookContext<T>): Promise<Decision | undefined> {
    if (!context.identity) {
      return
    }

    const cacheKey = key(context.flagKey, context.identity.distinctId)
    return await this.#cache.get(cacheKey)
  }

  async after(context: HookContext<T>, decision: Decision): Promise<void> {
    if (!context.identity) {
      return
    }

    const cacheKey = key(context.flagKey, context.identity.distinctId)
    await this.#cache.set(cacheKey, decision)
  }
}
