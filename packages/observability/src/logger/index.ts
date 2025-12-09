import { isDevelopment } from "@init/utils/environment"
import {
  configure,
  getConsoleSink,
  getLogger,
  jsonLinesFormatter,
} from "@logtape/logtape"
import { getPrettyFormatter } from "@logtape/pretty"
import { DEFAULT_REDACT_FIELDS, redactByField } from "@logtape/redaction"

const customSink = redactByField(
  getConsoleSink({
    formatter: isDevelopment()
      ? getPrettyFormatter({
          timestamp: "time",
          properties: true,
          categoryWidth: 15,
          categoryTruncate: "middle",
        })
      : jsonLinesFormatter,
    nonBlocking: true,
  }),
  {
    fieldPatterns: [
      /pass(?:code|phrase|word)/i,
      /api[-_]?key/i,
      "secret",
      ...DEFAULT_REDACT_FIELDS,
    ],
    action: () => "[REDACTED]",
  }
)

await configure({
  sinks: {
    console: customSink,
    meta: customSink,
  },
  loggers: [
    {
      category: ["default"],
      lowestLevel: "trace",
      sinks: ["console"],
    },
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["meta"],
    },
  ],
})

export const logger = getLogger(["default"])

export type { Logger } from "@logtape/logtape"
