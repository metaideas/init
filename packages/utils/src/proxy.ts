export function createRecursiveProxy(
  callback: (opts: { path: readonly string[]; args: readonly unknown[] }) => unknown,
  path: readonly string[]
): unknown {
  return new Proxy(
    () => {
      // Dummy no-op function since we don't have any client-side target we want
      // to remap to
    },
    {
      apply(_1, _2, args) {
        return callback({ args, path })
      },
      get: (_obj, key) => {
        if (typeof key !== "string") {
          return
        }

        const nextPath = [...path, key]

        // `$`-prefixed helpers (e.g. `$path`, `$schema`) are accessed directly
        // as properties, so we invoke the callback immediately.
        if (key.startsWith("$")) {
          return callback({ args: [], path: nextPath })
        }

        // For all other keys, keep recursing and treat the final value as
        // a callable function (handled in the `apply` trap).
        return createRecursiveProxy(callback, nextPath)
      },
    }
  )
}
