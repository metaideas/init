// Taken and modified from https://github.com/epicweb-dev/remember/blob/main/index.js

export function singleton<T>(name: string, getValue: () => T) {
  const thusly = globalThis as unknown as {
    __remember_init: Map<string, T>
  }

  thusly.__remember_init ??= new Map()

  if (!thusly.__remember_init.has(name)) {
    thusly.__remember_init.set(name, getValue())
  }

  return thusly.__remember_init.get(name) as T
}

/**
 * Forgets a remembered value by a given name. Does not throw if the name doesn't exist.
 *
 * @param {string} name - The name under which the value was remembered.
 * @return {boolean} - A remembered value existed and has been forgotten.
 */
export function forget(name: string) {
  const thusly = globalThis as unknown as {
    __remember_init: Map<string, unknown>
  }

  thusly.__remember_init ??= new Map()

  return thusly.__remember_init.delete(name)
}
