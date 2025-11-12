import { describe, expect, test } from "bun:test"
import { type Duration, duration } from "../duration"

describe("duration", () => {
  describe("milliseconds", () => {
    test("converts milliseconds without space", () => {
      expect(duration("100ms")).toBe(100)
    })

    test("converts milliseconds with space", () => {
      expect(duration("100 ms")).toBe(100)
    })

    test("handles zero milliseconds", () => {
      expect(duration("0ms")).toBe(0)
    })

    test("handles large millisecond values", () => {
      expect(duration("999999ms")).toBe(999_999)
    })
  })

  describe("seconds", () => {
    test("converts seconds without space", () => {
      expect(duration("5s")).toBe(5000)
    })

    test("converts seconds with space", () => {
      expect(duration("5 s")).toBe(5000)
    })

    test("handles zero seconds", () => {
      expect(duration("0s")).toBe(0)
    })

    test("handles large second values", () => {
      expect(duration("60s")).toBe(60_000)
    })
  })

  describe("minutes", () => {
    test("converts minutes without space", () => {
      expect(duration("1m")).toBe(60_000)
    })

    test("converts minutes with space", () => {
      expect(duration("1 m")).toBe(60_000)
    })

    test("handles multiple minutes", () => {
      expect(duration("5m")).toBe(300_000)
    })

    test("handles zero minutes", () => {
      expect(duration("0m")).toBe(0)
    })
  })

  describe("hours", () => {
    test("converts hours without space", () => {
      expect(duration("1h")).toBe(3_600_000)
    })

    test("converts hours with space", () => {
      expect(duration("1 h")).toBe(3_600_000)
    })

    test("handles multiple hours", () => {
      expect(duration("24h")).toBe(86_400_000)
    })

    test("handles zero hours", () => {
      expect(duration("0h")).toBe(0)
    })
  })

  describe("days", () => {
    test("converts days without space", () => {
      expect(duration("1d")).toBe(86_400_000)
    })

    test("converts days with space", () => {
      expect(duration("1 d")).toBe(86_400_000)
    })

    test("handles multiple days", () => {
      expect(duration("7d")).toBe(604_800_000)
    })

    test("handles zero days", () => {
      expect(duration("0d")).toBe(0)
    })
  })

  describe("error cases", () => {
    test("throws error for invalid format", () => {
      expect(() => duration("invalid" as unknown as Duration)).toThrow(
        "Unable to parse window size: invalid"
      )
    })

    test("throws error for missing unit", () => {
      expect(() => duration("100" as unknown as Duration)).toThrow(
        "Unable to parse window size: 100"
      )
    })

    test("throws error for invalid unit", () => {
      expect(() => duration("100x" as unknown as Duration)).toThrow(
        "Unable to parse window size: 100x"
      )
    })

    test("throws error for empty string", () => {
      expect(() => duration("" as unknown as Duration)).toThrow(
        "Unable to parse window size: "
      )
    })

    test("throws error for negative numbers", () => {
      expect(() => duration("-5s" as unknown as Duration)).toThrow(
        "Unable to parse window size: -5s"
      )
    })

    test("throws error for decimal numbers", () => {
      expect(() => duration("5.5s" as unknown as Duration)).toThrow(
        "Unable to parse window size: 5.5s"
      )
    })
  })
})
