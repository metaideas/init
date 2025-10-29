import type * as z from "./schema"

export function safeParseJSON<T extends z.ZodType>(
  text: string,
  schema: T
): [data: z.infer<T>, error: null] | [data: null, error: Error] {
  try {
    const result = schema.parse(JSON.parse(text))
    return [result, null]
  } catch (error) {
    return [null, error as Error]
  }
}
