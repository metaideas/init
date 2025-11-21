import * as z from "@init/utils/schema"
import type { RequestsSchema } from "./types"

export function flatten<T extends RequestsSchema>(
  events: T,
  prefix = ""
): Record<string, z.core.$ZodType> {
  const result: Record<string, z.core.$ZodType> = {}

  for (const [key, value] of Object.entries(events)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (value instanceof z.core.$ZodType) {
      result[path] = value
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value as T, path))
    }
  }

  return result
}
