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
  ms: 1,
  s: MS_PER_SECOND,
  m: MS_PER_MINUTE,
  h: MS_PER_HOUR,
  d: MS_PER_DAY,
  w: MS_PER_WEEK,
} as const

/**
 * Convert a human readable duration to milliseconds
 */
export function duration(d: Duration) {
  const match = unitRegex.exec(d)
  if (!match) {
    throw new Error(`Invalid duration format: ${d}`)
  }

  const time = Number.parseInt(match[1], 10)
  const unit = match[2] as Unit
  const milliseconds = time * UNIT_TO_MS[unit]

  return {
    toMilliseconds() {
      return milliseconds
    },
    toSeconds() {
      return milliseconds / MS_PER_SECOND
    },
    toMinutes() {
      return milliseconds / MS_PER_MINUTE
    },
    toHours() {
      return milliseconds / MS_PER_HOUR
    },
    toDays() {
      return milliseconds / MS_PER_DAY
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
