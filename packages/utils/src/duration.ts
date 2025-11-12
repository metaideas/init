import { regex } from "arkregex"

type Unit = "ms" | "s" | "m" | "h" | "d"
export type Duration = `${number} ${Unit}` | `${number}${Unit}`

/**
 * Convert a human readable duration to milliseconds
 */
export function duration(d: Duration): number {
  const match = regex("^(\\d+)\\s?(ms|s|m|h|d)$").exec(d)
  if (!match) {
    throw new Error(`Unable to parse window size: ${d}`)
  }

  const time = Number.parseInt(match[1], 10)
  const unit = match[2] as Unit

  switch (unit) {
    case "ms": {
      return time
    }
    case "s": {
      return time * 1000
    }
    case "m": {
      return time * 1000 * 60
    }
    case "h": {
      return time * 1000 * 60 * 60
    }
    case "d": {
      return time * 1000 * 60 * 60 * 24
    }

    default: {
      throw new Error(`Unable to parse window size: ${d}`)
    }
  }
}
