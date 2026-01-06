/**
 * Serializes a value into a stable string representation suitable for cache
 * keys. Objects are serialized with sorted key-value pairs, comma-separated,
 * then joined with colons. Arrays and primitives use JSON serialization.
 *
 * @example
 * stableSerialize({ b: 2, a: 1 }) === stableSerialize({ a: 1, b: 2 }) // true
 * stableSerialize([1, 2, 3]) // "[1,2,3]"
 * stableSerialize("hello") // "\"hello\""
 * stableSerialize({ x: 1, y: 2 }) // "x:1,y:2"
 * stableSerialize({ a: "foo", b: [1, 2] }) // "a:\"foo\",b:[1,2]"
 */
export function stableSerialize(value: unknown): string {
  // Primitives and null - use JSON.stringify
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  // Arrays - serialize each element recursively
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableSerialize(v)).join(",")}]`
  }

  // Objects - sort keys for stability, then create comma-separated key:value pairs
  const serializedKeys = Object.keys(value)
    .toSorted()
    .map((k) => `${k}:${stableSerialize(value[k as keyof typeof value])}`)
    .join(",")

  return serializedKeys
}
