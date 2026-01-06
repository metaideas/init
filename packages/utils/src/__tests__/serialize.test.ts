import { describe, expect, it } from "bun:test"
import { stableSerialize } from "../serialize"

describe("stableSerialize", () => {
  describe("primitives", () => {
    it("should serialize strings", () => {
      const result = stableSerialize("hello")
      expect(result).toBe('"hello"')
    })

    it("should serialize numbers", () => {
      const result = stableSerialize(42)
      expect(result).toBe("42")
    })

    it("should serialize booleans", () => {
      expect(stableSerialize(true)).toBe("true")
      expect(stableSerialize(false)).toBe("false")
    })

    it("should serialize null", () => {
      const result = stableSerialize(null)
      expect(result).toBe("null")
    })

    it("should serialize undefined", () => {
      // oxlint-disable-next-line no-useless-undefined
      const result = stableSerialize(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe("arrays", () => {
    it("should serialize empty arrays", () => {
      const result = stableSerialize([])
      expect(result).toBe("[]")
    })

    it("should serialize arrays of primitives", () => {
      const result = stableSerialize([1, 2, 3])
      expect(result).toBe("[1,2,3]")
    })

    it("should serialize arrays of strings", () => {
      const result = stableSerialize(["a", "b", "c"])
      expect(result).toBe('["a","b","c"]')
    })

    it("should serialize nested arrays", () => {
      const result = stableSerialize([1, [2, 3], 4])
      expect(result).toBe("[1,[2,3],4]")
    })

    it("should serialize arrays with mixed types", () => {
      const result = stableSerialize([1, "hello", true, null])
      expect(result).toBe('[1,"hello",true,null]')
    })
  })

  describe("objects", () => {
    it("should serialize empty objects", () => {
      const result = stableSerialize({})
      expect(result).toBe("")
    })

    it("should serialize simple objects with sorted keys and values", () => {
      const result1 = stableSerialize({ a: 1, b: 2 })
      const result2 = stableSerialize({ a: 1, b: 2 })
      expect(result1).toBe(result2)
      expect(result1).toBe("a:1,b:2")
    })

    it("should serialize objects with string values", () => {
      const result = stableSerialize({ x: "foo", y: "bar" })
      expect(result).toBe('x:"foo",y:"bar"')
    })

    it("should serialize objects with number values", () => {
      const result = stableSerialize({ count: 42, id: 1 })
      expect(result).toBe("count:42,id:1")
    })

    it("should handle objects with multiple keys", () => {
      const obj = { a: 1, m: 2, z: 3 }
      const result = stableSerialize(obj)
      expect(result).toBe("a:1,m:2,z:3")
    })
  })

  describe("nested structures", () => {
    it("should serialize objects containing arrays", () => {
      const result = stableSerialize({ items: [1, 2, 3] })
      expect(result).toBe("items:[1,2,3]")
    })

    it("should serialize arrays containing objects", () => {
      const result1 = stableSerialize([
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ])
      const result2 = stableSerialize([
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ])
      expect(result1).toBe(result2)
      expect(result1).toBe("[a:1,b:2,c:3,d:4]")
    })

    it("should serialize deeply nested structures", () => {
      const obj = {
        tags: ["admin", "user"],
        user: {
          age: 30,
          name: "Alice",
        },
      }
      const result = stableSerialize(obj)
      expect(result).toBe('tags:["admin","user"],user:age:30,name:"Alice"')
    })
  })

  describe("stability", () => {
    it("should produce same output for objects with different key order", () => {
      const obj1 = { a: 1, b: 2, c: 3 }
      const obj2 = { a: 1, b: 2, c: 3 }
      const obj3 = { a: 1, b: 2, c: 3 }

      const result1 = stableSerialize(obj1)
      const result2 = stableSerialize(obj2)
      const result3 = stableSerialize(obj3)

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })

    it("should produce different output for objects with different values", () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 3 }

      const result1 = stableSerialize(obj1)
      const result2 = stableSerialize(obj2)

      expect(result1).toBe("a:1,b:2")
      expect(result2).toBe("a:1,b:3")
      expect(result1).not.toBe(result2)
    })

    it("should produce different output for objects with different keys", () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, c: 2 }

      const result1 = stableSerialize(obj1)
      const result2 = stableSerialize(obj2)

      expect(result1).toBe("a:1,b:2")
      expect(result2).toBe("a:1,c:2")
      expect(result1).not.toBe(result2)
    })

    it("should be deterministic for complex nested structures", () => {
      const complex = {
        a: { nested: true, value: 42 },
        m: "middle",
        z: [3, 2, 1],
      }

      const result1 = stableSerialize(complex)
      const result2 = stableSerialize(complex)

      expect(result1).toBe(result2)
    })
  })
})
