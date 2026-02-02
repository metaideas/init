import { describe, expect, test } from "bun:test"
import { format, milliseconds, parse, parseStrict, seconds } from "#duration.ts"

describe("parse", () => {
  test("parses milliseconds", () => {
    expect(parse("100ms")).toBe(100)
    expect(parse("100 ms")).toBe(100)
    expect(parse("100msec")).toBe(100)
    expect(parse("100msecs")).toBe(100)
    expect(parse("100millisecond")).toBe(100)
    expect(parse("100milliseconds")).toBe(100)
  })

  test("parses seconds", () => {
    expect(parse("1s")).toBe(1000)
    expect(parse("1 s")).toBe(1000)
    expect(parse("1sec")).toBe(1000)
    expect(parse("1secs")).toBe(1000)
    expect(parse("1second")).toBe(1000)
    expect(parse("1seconds")).toBe(1000)
    expect(parse("5s")).toBe(5000)
  })

  test("parses minutes", () => {
    expect(parse("1m")).toBe(60_000)
    expect(parse("1 m")).toBe(60_000)
    expect(parse("1min")).toBe(60_000)
    expect(parse("1mins")).toBe(60_000)
    expect(parse("1minute")).toBe(60_000)
    expect(parse("1minutes")).toBe(60_000)
    expect(parse("2m")).toBe(120_000)
  })

  test("parses hours", () => {
    expect(parse("1h")).toBe(3_600_000)
    expect(parse("1 h")).toBe(3_600_000)
    expect(parse("1hr")).toBe(3_600_000)
    expect(parse("1hrs")).toBe(3_600_000)
    expect(parse("1hour")).toBe(3_600_000)
    expect(parse("1hours")).toBe(3_600_000)
    expect(parse("2h")).toBe(7_200_000)
  })

  test("parses days", () => {
    expect(parse("1d")).toBe(86_400_000)
    expect(parse("1 d")).toBe(86_400_000)
    expect(parse("1day")).toBe(86_400_000)
    expect(parse("1days")).toBe(86_400_000)
    expect(parse("2d")).toBe(172_800_000)
  })

  test("parses weeks", () => {
    expect(parse("1w")).toBe(604_800_000)
    expect(parse("1 w")).toBe(604_800_000)
    expect(parse("1week")).toBe(604_800_000)
    expect(parse("1weeks")).toBe(604_800_000)
    expect(parse("2w")).toBe(1_209_600_000)
  })

  test("parses months", () => {
    const oneMonth = (86_400_000 * 365.25) / 12
    expect(parse("1mo")).toBe(oneMonth)
    expect(parse("1 mo")).toBe(oneMonth)
    expect(parse("1month")).toBe(oneMonth)
    expect(parse("1months")).toBe(oneMonth)
  })

  test("parses years", () => {
    const oneYear = 86_400_000 * 365.25
    expect(parse("1y")).toBe(oneYear)
    expect(parse("1 y")).toBe(oneYear)
    expect(parse("1yr")).toBe(oneYear)
    expect(parse("1yrs")).toBe(oneYear)
    expect(parse("1year")).toBe(oneYear)
    expect(parse("1years")).toBe(oneYear)
  })

  test("parses case-insensitive units", () => {
    expect(parse("1H")).toBe(3_600_000)
    expect(parse("1HOUR")).toBe(3_600_000)
    expect(parse("1Hour")).toBe(3_600_000)
    expect(parse("1MS")).toBe(1)
  })

  test("parses decimal values", () => {
    expect(parse("1.5h")).toBe(5_400_000)
    expect(parse("0.5d")).toBe(43_200_000)
    expect(parse("2.5s")).toBe(2500)
  })

  test("parses negative values", () => {
    expect(parse("-1s")).toBe(-1000)
    expect(parse("-5m")).toBe(-300_000)
    expect(parse("-100ms")).toBe(-100)
  })

  test("parses number-only strings as milliseconds", () => {
    expect(parse("100")).toBe(100)
    expect(parse("500")).toBe(500)
  })

  test("returns NaN for invalid strings", () => {
    expect(parse("invalid")).toBeNaN()
    expect(parse("abc123")).toBeNaN()
  })

  test("throws for empty string", () => {
    expect(() => parse("")).toThrow()
  })

  test("throws for string exceeding 100 characters", () => {
    expect(() => parse("a".repeat(101))).toThrow()
  })
})

describe("parseStrict", () => {
  test("parses valid DurationInput values", () => {
    expect(parseStrict("1h")).toBe(3_600_000)
    expect(parseStrict("30m")).toBe(1_800_000)
    expect(parseStrict("100ms")).toBe(100)
    expect(parseStrict("1 hour")).toBe(3_600_000)
  })
})

describe("format", () => {
  test("formats milliseconds (short)", () => {
    expect(format(500)).toBe("500ms")
    expect(format(0)).toBe("0ms")
    expect(format(1)).toBe("1ms")
  })

  test("formats seconds (short)", () => {
    expect(format(1000)).toBe("1s")
    expect(format(5000)).toBe("5s")
    expect(format(1500)).toBe("2s")
  })

  test("formats minutes (short)", () => {
    expect(format(60_000)).toBe("1m")
    expect(format(120_000)).toBe("2m")
    expect(format(90_000)).toBe("2m")
  })

  test("formats hours (short)", () => {
    expect(format(3_600_000)).toBe("1h")
    expect(format(7_200_000)).toBe("2h")
  })

  test("formats days (short)", () => {
    expect(format(86_400_000)).toBe("1d")
    expect(format(172_800_000)).toBe("2d")
  })

  test("formats weeks (short)", () => {
    expect(format(604_800_000)).toBe("1w")
    expect(format(1_209_600_000)).toBe("2w")
  })

  test("formats months (short)", () => {
    const oneMonth = (86_400_000 * 365.25) / 12
    expect(format(oneMonth)).toBe("1mo")
    expect(format(oneMonth * 2)).toBe("2mo")
  })

  test("formats years (short)", () => {
    const oneYear = 86_400_000 * 365.25
    expect(format(oneYear)).toBe("1y")
    expect(format(oneYear * 2)).toBe("2y")
  })

  test("formats with long option", () => {
    expect(format(1000, { long: true })).toBe("1 second")
    expect(format(2000, { long: true })).toBe("2 seconds")
    expect(format(60_000, { long: true })).toBe("1 minute")
    expect(format(120_000, { long: true })).toBe("2 minutes")
    expect(format(3_600_000, { long: true })).toBe("1 hour")
    expect(format(7_200_000, { long: true })).toBe("2 hours")
    expect(format(86_400_000, { long: true })).toBe("1 day")
    expect(format(172_800_000, { long: true })).toBe("2 days")
  })

  test("formats negative values", () => {
    expect(format(-1000)).toBe("-1s")
    expect(format(-60_000)).toBe("-1m")
  })

  test("throws for non-number input", () => {
    // @ts-expect-error testing invalid input
    expect(() => format("100")).toThrow()
  })

  test("throws for non-finite numbers", () => {
    expect(() => format(Number.POSITIVE_INFINITY)).toThrow()
    expect(() => format(Number.NaN)).toThrow()
  })
})

describe("milliseconds", () => {
  test("parses string to milliseconds", () => {
    expect(milliseconds("1s")).toBe(1000)
    expect(milliseconds("1m")).toBe(60_000)
    expect(milliseconds("1h")).toBe(3_600_000)
    expect(milliseconds("1d")).toBe(86_400_000)
  })

  test("formats number to string", () => {
    expect(milliseconds(1000)).toBe("1s")
    expect(milliseconds(60_000)).toBe("1m")
    expect(milliseconds(3_600_000)).toBe("1h")
  })

  test("accepts options for formatting", () => {
    expect(milliseconds(1000, { long: true })).toBe("1 second")
    expect(milliseconds(60_000, { long: true })).toBe("1 minute")
  })
})

describe("seconds", () => {
  test("parses string to seconds", () => {
    expect(seconds("1s")).toBe(1)
    expect(seconds("1m")).toBe(60)
    expect(seconds("1h")).toBe(3600)
    expect(seconds("1d")).toBe(86_400)
    expect(seconds("500ms")).toBe(0.5)
  })

  test("formats seconds to string", () => {
    expect(seconds(1)).toBe("1s")
    expect(seconds(60)).toBe("1m")
    expect(seconds(3600)).toBe("1h")
  })

  test("accepts options for formatting", () => {
    expect(seconds(1, { long: true })).toBe("1 second")
    expect(seconds(60, { long: true })).toBe("1 minute")
  })
})
