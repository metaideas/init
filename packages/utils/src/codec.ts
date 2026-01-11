import * as z from "./schema"

export const jsonCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString) as z.input<T>
      } catch (error) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        return z.NEVER
      }
    },
    encode: (value) => JSON.stringify(value),
  })
