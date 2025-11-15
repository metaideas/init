import { describe, expect, test } from "bun:test"
import { type Duration, duration } from "../duration"

describe("duration", () => {
  describe("toMilliseconds", () => {
    describe("milliseconds", () => {
      test("converts milliseconds without space", () => {
        expect(duration("100ms").toMilliseconds()).toBe(100)
      })

      test("converts milliseconds with space", () => {
        expect(duration("100 ms").toMilliseconds()).toBe(100)
      })

      test("handles zero milliseconds", () => {
        expect(duration("0ms").toMilliseconds()).toBe(0)
      })

      test("handles large millisecond values", () => {
        expect(duration("999999ms").toMilliseconds()).toBe(999_999)
      })
    })

    describe("seconds", () => {
      test("converts seconds without space", () => {
        expect(duration("5s").toMilliseconds()).toBe(5000)
      })

      test("converts seconds with space", () => {
        expect(duration("5 s").toMilliseconds()).toBe(5000)
      })

      test("handles zero seconds", () => {
        expect(duration("0s").toMilliseconds()).toBe(0)
      })

      test("handles large second values", () => {
        expect(duration("60s").toMilliseconds()).toBe(60_000)
      })
    })

    describe("minutes", () => {
      test("converts minutes without space", () => {
        expect(duration("1m").toMilliseconds()).toBe(60_000)
      })

      test("converts minutes with space", () => {
        expect(duration("1 m").toMilliseconds()).toBe(60_000)
      })

      test("handles multiple minutes", () => {
        expect(duration("5m").toMilliseconds()).toBe(300_000)
      })

      test("handles zero minutes", () => {
        expect(duration("0m").toMilliseconds()).toBe(0)
      })
    })

    describe("hours", () => {
      test("converts hours without space", () => {
        expect(duration("1h").toMilliseconds()).toBe(3_600_000)
      })

      test("converts hours with space", () => {
        expect(duration("1 h").toMilliseconds()).toBe(3_600_000)
      })

      test("handles multiple hours", () => {
        expect(duration("24h").toMilliseconds()).toBe(86_400_000)
      })

      test("handles zero hours", () => {
        expect(duration("0h").toMilliseconds()).toBe(0)
      })
    })

    describe("days", () => {
      test("converts days without space", () => {
        expect(duration("1d").toMilliseconds()).toBe(86_400_000)
      })

      test("converts days with space", () => {
        expect(duration("1 d").toMilliseconds()).toBe(86_400_000)
      })

      test("handles multiple days", () => {
        expect(duration("7d").toMilliseconds()).toBe(604_800_000)
      })

      test("handles zero days", () => {
        expect(duration("0d").toMilliseconds()).toBe(0)
      })
    })
  })

  describe("toSeconds", () => {
    describe("milliseconds", () => {
      test("converts milliseconds without space", () => {
        expect(duration("100ms").toSeconds()).toBe(0.1)
      })

      test("converts milliseconds with space", () => {
        expect(duration("100 ms").toSeconds()).toBe(0.1)
      })

      test("handles zero milliseconds", () => {
        expect(duration("0ms").toSeconds()).toBe(0)
      })

      test("handles large millisecond values", () => {
        expect(duration("999999ms").toSeconds()).toBe(999.999)
      })

      test("converts 1000ms to 1 second", () => {
        expect(duration("1000ms").toSeconds()).toBe(1)
      })
    })

    describe("seconds", () => {
      test("converts seconds without space", () => {
        expect(duration("5s").toSeconds()).toBe(5)
      })

      test("converts seconds with space", () => {
        expect(duration("5 s").toSeconds()).toBe(5)
      })

      test("handles zero seconds", () => {
        expect(duration("0s").toSeconds()).toBe(0)
      })

      test("handles large second values", () => {
        expect(duration("60s").toSeconds()).toBe(60)
      })
    })

    describe("minutes", () => {
      test("converts minutes without space", () => {
        expect(duration("1m").toSeconds()).toBe(60)
      })

      test("converts minutes with space", () => {
        expect(duration("1 m").toSeconds()).toBe(60)
      })

      test("handles multiple minutes", () => {
        expect(duration("5m").toSeconds()).toBe(300)
      })

      test("handles zero minutes", () => {
        expect(duration("0m").toSeconds()).toBe(0)
      })
    })

    describe("hours", () => {
      test("converts hours without space", () => {
        expect(duration("1h").toSeconds()).toBe(3600)
      })

      test("converts hours with space", () => {
        expect(duration("1 h").toSeconds()).toBe(3600)
      })

      test("handles multiple hours", () => {
        expect(duration("24h").toSeconds()).toBe(86_400)
      })

      test("handles zero hours", () => {
        expect(duration("0h").toSeconds()).toBe(0)
      })
    })

    describe("days", () => {
      test("converts days without space", () => {
        expect(duration("1d").toSeconds()).toBe(86_400)
      })

      test("converts days with space", () => {
        expect(duration("1 d").toSeconds()).toBe(86_400)
      })

      test("handles multiple days", () => {
        expect(duration("7d").toSeconds()).toBe(604_800)
      })

      test("handles zero days", () => {
        expect(duration("0d").toSeconds()).toBe(0)
      })
    })
  })

  describe("method chaining", () => {
    test("can call toSeconds after toMilliseconds", () => {
      const d = duration("5s")
      expect(d.toMilliseconds()).toBe(5000)
      expect(d.toSeconds()).toBe(5)
    })

    test("can call toMilliseconds multiple times", () => {
      const d = duration("10m")
      expect(d.toMilliseconds()).toBe(600_000)
      expect(d.toMilliseconds()).toBe(600_000)
    })

    test("can call toSeconds multiple times", () => {
      const d = duration("2h")
      expect(d.toSeconds()).toBe(7200)
      expect(d.toSeconds()).toBe(7200)
    })
  })

  describe("error cases", () => {
    test("throws error for invalid format", () => {
      expect(() => duration("invalid" as unknown as Duration)).toThrow(
        "Invalid duration format: invalid"
      )
    })

    test("throws error for missing unit", () => {
      expect(() => duration("100" as unknown as Duration)).toThrow(
        "Invalid duration format: 100"
      )
    })

    test("throws error for invalid unit", () => {
      expect(() => duration("100x" as unknown as Duration)).toThrow(
        "Invalid duration format: 100x"
      )
    })

    test("throws error for empty string", () => {
      expect(() => duration("" as unknown as Duration)).toThrow(
        "Invalid duration format: "
      )
    })

    test("throws error for negative numbers", () => {
      expect(() => duration("-5s" as unknown as Duration)).toThrow(
        "Invalid duration format: -5s"
      )
    })

    test("throws error for decimal numbers", () => {
      expect(() => duration("5.5s" as unknown as Duration)).toThrow(
        "Invalid duration format: 5.5s"
      )
    })
  })
})
