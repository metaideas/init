import { regex } from "arkregex"

type Unit = "ms" | "s" | "m" | "h" | "d" | "w"
export type Duration = `${number} ${Unit}` | `${number}${Unit}`

const unitRegex = regex("^(\\d+) ?(ms|s|m|h|d|w)$")

// Conversion factors as constants
const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 1000 * 60
const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_DAY = 1000 * 60 * 60 * 24
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7

const UNIT_TO_MS: Record<Unit, number> = {
  d: MS_PER_DAY,
  h: MS_PER_HOUR,
  m: MS_PER_MINUTE,
  ms: 1,
  s: MS_PER_SECOND,
  w: MS_PER_WEEK,
} as const

/**
 * Convert a human readable duration to milliseconds
 */
export function duration(d: Duration) {
  const match = unitRegex.exec(d)
  if (!match || match.length < 3 || !match[1] || !match[2]) {
    throw new Error(`Invalid duration format: ${d}`)
  }

  const time = Number.parseInt(match[1], 10)
  const unit = match[2] as Unit
  const milliseconds = time * UNIT_TO_MS[unit]

  return {
    toDays() {
      return milliseconds / MS_PER_DAY
    },
    toHours() {
      return milliseconds / MS_PER_HOUR
    },
    toMilliseconds() {
      return milliseconds
    },
    toMinutes() {
      return milliseconds / MS_PER_MINUTE
    },
    toSeconds() {
      return milliseconds / MS_PER_SECOND
    },
    toWeeks() {
      return milliseconds / MS_PER_WEEK
    },
  }
}

// Helper functions for direct conversions
export function toMilliseconds(d: Duration): number {
  return duration(d).toMilliseconds()
}

export function toSeconds(d: Duration): number {
  return duration(d).toSeconds()
}
