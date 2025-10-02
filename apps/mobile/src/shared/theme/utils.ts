import type { TextStyle } from "react-native"
import { typography } from "./tokens"

/**
 * Converts a color to rgba with the given opacity
 */
export function alpha(color: string, opacity: number) {
  if (color.startsWith("hsl(")) {
    return `hsla(${color.slice("hsl(".length, -1)}, ${opacity})`
  }

  if (color.startsWith("rgb(")) {
    return `rgba(${color.slice("rgb(".length, -1)}, ${opacity})`
  }

  if (color.startsWith("#")) {
    if (color.length === 7) {
      const alphaHex = Math.round(opacity * 255).toString(16)

      return color.slice(0, 7) + alphaHex.padStart(2, "0")
    }
    if (color.length === 4) {
      // convert to 6-digit hex before adding opacity

      const [r, g, b] = color.slice(1).split("") as [string, string, string]

      const alphaHex = Math.round(opacity * 255).toString(16)

      return `#${r.repeat(2)}${g.repeat(2)}${b.repeat(2)}${alphaHex.padStart(
        2,
        "0"
      )}`
    }
  }

  return color
}
export function shadow(elevation: number) {
  return {
    shadowOffset: {
      width: 0,
      height: elevation * 0.5,
    },
    shadowOpacity: elevation * 0.05,
    shadowRadius: elevation * 1.2,
    elevation, // Android
  }
}

export function scale(baseValue: number, scaleFactor: number) {
  return baseValue * scaleFactor
}

export function leading(textStyle: TextStyle): Pick<TextStyle, "lineHeight"> {
  const lineHeight = textStyle?.lineHeight || typography.lineHeight.snug
  const size = textStyle?.fontSize || typography.fontSize.sm

  return {
    lineHeight: Math.round(size * lineHeight),
  }
}
