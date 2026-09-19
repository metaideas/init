// Taken and modified from https://github.com/epicweb-dev/remember/blob/main/index.js

const registryKey = "__remember_init"
type SingletonRegistry = Map<string, unknown>
type GlobalSingletonRegistry = typeof globalThis & {
  [registryKey]?: SingletonRegistry
}

export function singleton<T>(name: string, getValue: () => T) {
  // SAFETY: This module owns the registry property and always initializes it with a Map.
  const globalRegistry = globalThis as GlobalSingletonRegistry
  globalRegistry[registryKey] ??= new Map()

  if (!globalRegistry[registryKey].has(name)) {
    globalRegistry[registryKey].set(name, getValue())
  }

  // SAFETY: A singleton name identifies one value contract; this function inserts T before this read.
  return globalRegistry[registryKey].get(name) as T
}

/**
 * Forgets a remembered value by a given name. Does not throw if the name doesn't exist.
 */
export function forget(name: string) {
  // SAFETY: This module owns the registry property and always initializes it with a Map.
  const globalRegistry = globalThis as GlobalSingletonRegistry
  globalRegistry[registryKey] ??= new Map()

  return globalRegistry[registryKey].delete(name)
}
