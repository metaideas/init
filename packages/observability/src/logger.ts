import { isDevelopment } from "@init/utils/environment"
import {
  configure,
  getConsoleSink,
  getLogger,
  jsonLinesFormatter,
} from "@logtape/logtape"
import { getPrettyFormatter } from "@logtape/pretty"
import { DEFAULT_REDACT_FIELDS, redactByField } from "@logtape/redaction"

/**
 * Logger categories are used to group log messages by their purpose.
 */
export const LoggerCategory = {
  DEFAULT: "default",
  API: "api",
}

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
      category: [LoggerCategory.DEFAULT, LoggerCategory.API],
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

export const logger = getLogger([LoggerCategory.DEFAULT])

export type { Logger } from "@logtape/logtape"
export { getLogger } from "@logtape/logtape"
