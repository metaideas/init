import { describe, expect, test } from "bun:test"
import { alpha, leading, scale, shadow } from "#shared/theme/utils.ts"

describe("alpha", () => {
  test("converts 6-digit hex color with opacity", () => {
    expect(alpha("#ff0000", 0.5)).toBe("#ff000080")
    expect(alpha("#00ff00", 0.25)).toBe("#00ff0040")
    expect(alpha("#0000ff", 0.75)).toBe("#0000ffbf")
  })

  test("converts 3-digit hex color with opacity", () => {
    expect(alpha("#f00", 0.5)).toBe("#ff000080")
    expect(alpha("#0f0", 0.25)).toBe("#00ff0040")
    expect(alpha("#00f", 0.75)).toBe("#0000ffbf")
  })

  test("handles edge case opacities for hex colors", () => {
    expect(alpha("#ffffff", 0)).toBe("#ffffff00")
    expect(alpha("#000000", 1)).toBe("#000000ff")
    expect(alpha("#123456", 0.01)).toBe("#12345603") // Math.round(0.01 * 255) = 3 = 0x3, padded to "03"
    expect(alpha("#abcdef", 0.99)).toBe("#abcdeffc")
    expect(alpha("#007bff", 0.05)).toBe("#007bff0d") // Math.round(0.05 * 255) = 13 = 0xd, padded to "0d"
  })

  test("handles single-digit hex alpha values correctly", () => {
    expect(alpha("#ffffff", 0.06)).toBe("#ffffff0f") // Math.round(0.06 * 255) = 15 = 0xf, padded to "0f"
  })

  test("converts rgb color with opacity", () => {
    expect(alpha("rgb(255, 0, 0)", 0.5)).toBe("rgba(255, 0, 0, 0.5)")
    expect(alpha("rgb(0, 255, 0)", 0.25)).toBe("rgba(0, 255, 0, 0.25)")
    expect(alpha("rgb(0, 0, 255)", 0.75)).toBe("rgba(0, 0, 255, 0.75)")
  })

  test("converts hsl color with opacity", () => {
    expect(alpha("hsl(0, 100%, 50%)", 0.5)).toBe("hsla(0, 100%, 50%, 0.5)")
    expect(alpha("hsl(120, 100%, 50%)", 0.25)).toBe("hsla(120, 100%, 50%, 0.25)")
    expect(alpha("hsl(240, 100%, 50%)", 0.75)).toBe("hsla(240, 100%, 50%, 0.75)")
  })

  test("handles colors without spaces in functional notation", () => {
    expect(alpha("rgb(255,0,0)", 0.5)).toBe("rgba(255,0,0, 0.5)")
    expect(alpha("hsl(0,100%,50%)", 0.5)).toBe("hsla(0,100%,50%, 0.5)")
  })

  test("returns color unchanged for unsupported formats", () => {
    expect(alpha("red", 0.5)).toBe("red")
    expect(alpha("transparent", 0.5)).toBe("transparent")
    expect(alpha("invalid-color", 0.5)).toBe("invalid-color")
  })

  test("handles edge cases", () => {
    expect(alpha("", 0.5)).toBe("")
    expect(alpha("#", 0.5)).toBe("#")
    expect(alpha("#12", 0.5)).toBe("#12")
  })
})

describe("shadow", () => {
  test("creates shadow object with correct properties", () => {
    const result = shadow(10)
    expect(result).toHaveProperty("shadowOffset")
    expect(result).toHaveProperty("shadowOpacity")
    expect(result).toHaveProperty("shadowRadius")
    expect(result).toHaveProperty("elevation")
  })

  test("calculates shadow values correctly for various elevations", () => {
    const shadow0 = shadow(0)
    expect(shadow0.shadowOffset.width).toBe(0)
    expect(shadow0.shadowOffset.height).toBe(0)
    expect(shadow0.shadowOpacity).toBe(0)
    expect(shadow0.shadowRadius).toBe(0)
    expect(shadow0.elevation).toBe(0)

    const shadow5 = shadow(5)
    expect(shadow5.shadowOffset.width).toBe(0)
    expect(shadow5.shadowOffset.height).toBe(2.5) // 5 * 0.5
    expect(shadow5.shadowOpacity).toBe(0.25) // 5 * 0.05
    expect(shadow5.shadowRadius).toBe(6) // 5 * 1.2
    expect(shadow5.elevation).toBe(5)

    const shadow10 = shadow(10)
    expect(shadow10.shadowOffset.width).toBe(0)
    expect(shadow10.shadowOffset.height).toBe(5) // 10 * 0.5
    expect(shadow10.shadowOpacity).toBe(0.5) // 10 * 0.05
    expect(shadow10.shadowRadius).toBe(12) // 10 * 1.2
    expect(shadow10.elevation).toBe(10)
  })

  test("handles small elevation values", () => {
    const result = shadow(1)
    expect(result.shadowOffset.height).toBe(0.5)
    expect(result.shadowOpacity).toBe(0.05)
    expect(result.shadowRadius).toBe(1.2)
    expect(result.elevation).toBe(1)
  })

  test("handles large elevation values", () => {
    const result = shadow(24)
    expect(result.shadowOffset.height).toBe(12)
    expect(result.shadowOpacity).toBeCloseTo(1.2) // Note: this exceeds 1.0, which may need clamping in actual use
    expect(result.shadowRadius).toBeCloseTo(28.8)
    expect(result.elevation).toBe(24)
  })

  test("handles decimal elevation values", () => {
    const result = shadow(2.5)
    expect(result.shadowOffset.height).toBe(1.25)
    expect(result.shadowOpacity).toBe(0.125)
    expect(result.shadowRadius).toBe(3)
    expect(result.elevation).toBe(2.5)
  })

  test("handles negative elevation values", () => {
    const result = shadow(-5)
    expect(result.shadowOffset.height).toBe(-2.5)
    expect(result.shadowOpacity).toBe(-0.25)
    expect(result.shadowRadius).toBe(-6)
    expect(result.elevation).toBe(-5)
  })
})

describe("scale", () => {
  test("multiplies base value by scale factor", () => {
    expect(scale(10, 2)).toBe(20)
    expect(scale(5, 3)).toBe(15)
    expect(scale(100, 0.5)).toBe(50)
  })

  test("handles zero values", () => {
    expect(scale(0, 5)).toBe(0)
    expect(scale(10, 0)).toBe(0)
    expect(scale(0, 0)).toBe(0)
  })

  test("handles negative values", () => {
    expect(scale(-10, 2)).toBe(-20)
    expect(scale(10, -2)).toBe(-20)
    expect(scale(-10, -2)).toBe(20)
  })

  test("handles decimal values", () => {
    expect(scale(10.5, 2)).toBe(21)
    expect(scale(10, 2.5)).toBe(25)
    expect(scale(7.5, 1.5)).toBe(11.25)
  })

  test("handles very small scale factors", () => {
    expect(scale(100, 0.01)).toBe(1)
    expect(scale(50, 0.1)).toBe(5)
  })

  test("handles large values", () => {
    expect(scale(1000, 10)).toBe(10_000)
    expect(scale(999, 999)).toBe(998_001)
  })

  test("identity scaling", () => {
    expect(scale(42, 1)).toBe(42)
    expect(scale(-42, 1)).toBe(-42)
    expect(scale(0, 1)).toBe(0)
  })
})

describe("leading", () => {
  test("calculates line height from fontSize and lineHeight", () => {
    const result = leading({ fontSize: 16, lineHeight: 1.5 })
    expect(result.lineHeight).toBe(24) // Math.round(16 * 1.5)
  })

  test("uses default snug lineHeight when not provided", () => {
    const result = leading({ fontSize: 16 })
    expect(result.lineHeight).toBe(21) // Math.round(16 * 1.3) - typography.lineHeight.snug = 1.3
  })

  test("uses default sm fontSize when not provided", () => {
    const result = leading({ lineHeight: 1.5 })
    expect(result.lineHeight).toBe(21) // Math.round(14 * 1.5) - typography.fontSize.sm = 14
  })

  test("uses both defaults when no textStyle properties provided", () => {
    const result = leading({})
    expect(result.lineHeight).toBe(18) // Math.round(14 * 1.3) - sm fontSize * snug lineHeight
  })

  test("handles various font sizes with lineHeight multipliers", () => {
    expect(leading({ fontSize: 12, lineHeight: 1.15 }).lineHeight).toBe(14) // tight
    expect(leading({ fontSize: 20, lineHeight: 1.3 }).lineHeight).toBe(26) // snug
    expect(leading({ fontSize: 24, lineHeight: 1.5 }).lineHeight).toBe(36) // relaxed
  })

  test("rounds line height correctly", () => {
    expect(leading({ fontSize: 15, lineHeight: 1.33 }).lineHeight).toBe(20) // Math.round(15 * 1.33) = 20
    expect(leading({ fontSize: 17, lineHeight: 1.4 }).lineHeight).toBe(24) // Math.round(17 * 1.4) = 24
  })

  test("handles edge cases", () => {
    expect(leading({ fontSize: 0, lineHeight: 1.5 }).lineHeight).toBe(21) // Uses default sm fontSize when fontSize is 0
    expect(leading({ fontSize: 100, lineHeight: 2 }).lineHeight).toBe(200)
  })

  test("accepts TextStyle with other properties", () => {
    const result = leading({
      fontSize: 18,
      lineHeight: 1.5,
      fontWeight: "bold",
      color: "#000000",
    })
    expect(result).toEqual({ lineHeight: 27 })
    expect(result).not.toHaveProperty("fontWeight")
    expect(result).not.toHaveProperty("color")
  })
})
