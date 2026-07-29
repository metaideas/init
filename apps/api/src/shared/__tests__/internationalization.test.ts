import { describe, expect, test } from "bun:test"
import { getRequestLocale } from "#shared/internationalization.ts"

describe("getRequestLocale", () => {
  test("selects the supported locale with the highest quality", () => {
    expect(getRequestLocale("en;q=0.5, es-DO;q=0.9")).toBe("es")
  })

  test("ignores supported locales with zero quality", () => {
    expect(getRequestLocale("es;q=0, en;q=0.5")).toBe("en")
  })

  test("falls back to the base locale for unsupported languages", () => {
    expect(getRequestLocale("fr-CA, de;q=0.8")).toBe("en")
  })
})
