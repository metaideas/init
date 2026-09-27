import { describe, expect, expectTypeOf, test } from "bun:test"
import * as full from "#schema/index.ts"
import * as mini from "#schema/mini.ts"

const entryPoints = [
  ["full", full],
  ["mini", mini],
] as const

describe.each(entryPoints)("httpUrl (%s)", (_name, z) => {
  test.each([
    "https://example.com",
    "http://example.com/path?query=1",
    "https://sub.example.co.uk",
  ])("accepts %s", (input) => {
    expect(z.httpUrl().parse(input)).toBe(input)
  })

  test.each([
    "http://localhost:3000",
    "ftp://example.com",
    "https://127.0.0.1",
    "example.com",
    "not a url",
  ])("rejects %s", (input) => {
    expect(z.httpUrl().safeParse(input).success).toBe(false)
  })
})

describe.each(entryPoints)("env (%s)", (_name, z) => {
  test.each(["development", "production", "test"])("accepts %s", (input) => {
    expect(z.env().parse(input)).toBe(input)
  })

  test("rejects other environments", () => {
    expect(z.env().safeParse("staging").success).toBe(false)
  })
})

describe.each(entryPoints)("branded (%s)", (_name, z) => {
  test("returns the input string", () => {
    const userId: string = z.branded("UserId").parse("user_123")

    expect(userId).toBe("user_123")
  })

  test("rejects non-string input", () => {
    expect(z.branded("UserId").safeParse(123).success).toBe(false)
  })
})

describe.each(entryPoints)("ip (%s)", (_name, z) => {
  test.each(["192.168.0.1", "::1", "2001:db8::8a2e:370:7334"])("accepts %s", (input) => {
    expect(z.ip().parse(input)).toBe(input)
  })

  test.each(["256.0.0.1", "example.com", ""])("rejects %s", (input) => {
    expect(z.ip().safeParse(input).success).toBe(false)
  })
})

describe("branded", () => {
  test("infers the same branded type from both entry points", () => {
    type FullUserId = full.infer<ReturnType<typeof full.branded<"UserId">>>
    type MiniUserId = mini.infer<ReturnType<typeof mini.branded<"UserId">>>

    expectTypeOf<FullUserId>().toEqualTypeOf<MiniUserId>()
    expectTypeOf<string>().not.toMatchTypeOf<MiniUserId>()
  })
})
