import { describe, expect, test } from "bun:test"
import { createRecursiveProxy } from "../proxy"

type Call = {
  path: readonly string[]
  args: readonly unknown[]
}

describe("createRecursiveProxy", () => {
  test("invokes callback with full path and args when called as a method", () => {
    const calls: Call[] = []

    const proxy = createRecursiveProxy((opts) => {
      calls.push(opts)
      return "result"
    }, []) as {
      foo: {
        bar: (...args: number[]) => string
      }
    }

    const result = proxy.foo.bar(1, 2, 3)

    expect(result).toBe("result")
    expect(calls.length).toBe(1)
    const [call] = calls
    if (!call) {
      throw new Error("Expected callback to be called exactly once")
    }
    expect(call.path).toEqual(["foo", "bar"])
    expect(call.args).toEqual([1, 2, 3])
  })

  test("computes `$`-prefixed helpers as properties without requiring a call", () => {
    const calls: Call[] = []

    const proxy = createRecursiveProxy((opts) => {
      calls.push(opts)

      const pathWithoutHelper = opts.path.slice(0, -1)

      if (opts.path.at(-1) === "$path") {
        return pathWithoutHelper.join(".")
      }

      return opts.path
    }, []) as {
      a: {
        b: {
          c: {
            $path: string
          }
        }
      }
    }

    const path = proxy.a.b.c.$path

    expect(path).toBe("a.b.c")
    expect(calls.length).toBe(1)
    const [call] = calls
    if (!call) {
      throw new Error("Expected callback to be called exactly once")
    }
    expect(call.path).toEqual(["a", "b", "c", "$path"])
    expect(call.args).toEqual([])
  })

  test("respects initial path prefix when resolving helpers", () => {
    const calls: Call[] = []

    const proxy = createRecursiveProxy(
      (opts) => {
        calls.push(opts)

        const pathWithoutHelper = opts.path.slice(0, -1)

        if (opts.path.at(-1) === "$path") {
          return pathWithoutHelper.join(".")
        }

        return
      },
      ["root"]
    ) as {
      x: {
        y: {
          $path: string
        }
      }
    }

    const path = proxy.x.y.$path

    expect(path).toBe("root.x.y")
    expect(calls.length).toBe(1)
    const [call] = calls
    if (!call) {
      throw new Error("Expected callback to be called exactly once")
    }
    expect(call.path).toEqual(["root", "x", "y", "$path"])
    expect(call.args).toEqual([])
  })

  test("does not invoke callback for non-string property keys", () => {
    const calls: Call[] = []

    const proxy = createRecursiveProxy((opts) => {
      calls.push(opts)
      return
    }, []) as {
      [Symbol.toStringTag]?: unknown
    }

    // Accessing a symbol property should be ignored by the proxy logic
    const value = proxy[Symbol.toStringTag]

    expect(value).toBeUndefined()
    expect(calls.length).toBe(0)
  })
})
