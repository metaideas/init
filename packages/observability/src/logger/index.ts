import { isDevelopment } from "@init/utils/environment"
import { configureSync, getConsoleSink, getLogger, jsonLinesFormatter } from "@logtape/logtape"
import { getPrettyFormatter } from "@logtape/pretty"
import { redactSink } from "./utils"

const consoleSink = getConsoleSink({
  formatter: isDevelopment()
    ? getPrettyFormatter({
        categoryTruncate: "middle",
        categoryWidth: 15,
        levelStyle: "bold",
        messageStyle: "reset",
        properties: true,
        timestamp: "time",
      })
    : jsonLinesFormatter,
  nonBlocking: true,
})

export const LoggerCategory = {
  CONVEX: ["convex"],
  DEFAULT: ["default"],
  DRIZZLE_ORM: ["drizzle-orm"],
  HONO: ["hono"],
  INNGEST: ["inngest"],
  LOGTAPE: ["logtape", "meta"],
  SECURITY: ["security"],
} as const satisfies Record<string, string[]>

configureSync({
  loggers: [
    {
      category: LoggerCategory.LOGTAPE,
      lowestLevel: "warning",
      sinks: ["meta"],
    },
    {
      category: LoggerCategory.SECURITY,
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: LoggerCategory.INNGEST,
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: LoggerCategory.CONVEX,
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: LoggerCategory.HONO,
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: LoggerCategory.DRIZZLE_ORM,
      lowestLevel: "debug",
      sinks: ["console"],
    },
    {
      category: LoggerCategory.DEFAULT,
      lowestLevel: "trace",
      sinks: ["console"],
    },
  ],
  sinks: {
    console: redactSink(consoleSink),
    meta: consoleSink,
  },
})

export const logger = getLogger(LoggerCategory.DEFAULT)

export type { Logger } from "@logtape/logtape"
export { getLogger } from "@logtape/logtape"
