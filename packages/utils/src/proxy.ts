type ProxyCallbackOptions = {
  path: readonly string[]
  args: readonly unknown[]
}

export type ProxyCallback = (opts: ProxyCallbackOptions) => unknown

export function createRecursiveProxy(
  callback: ProxyCallback,
  path: readonly string[]
): unknown {
  return new Proxy(
    () => {
      // dummy no-op function since we don't have any client-side target we want
      // to remap to
    },
    {
      get: (_obj, key) => {
        if (typeof key !== "string") {
          return
        }

        return createRecursiveProxy(callback, [...path, key])
      },
    }
  )
}
