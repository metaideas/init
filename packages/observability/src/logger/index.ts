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

configureSync({
  loggers: [
    {
      category: ["logtape", "meta"],
      lowestLevel: "warning",
      sinks: ["meta"],
    },
    {
      category: ["security"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: ["hono"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    {
      category: ["drizzle-orm"],
      lowestLevel: "debug",
      sinks: ["console"],
    },
    {
      category: ["default"],
      lowestLevel: "trace",
      sinks: ["console"],
    },
  ],
  sinks: {
    console: redactSink(consoleSink),
    meta: consoleSink,
  },
})

export const logger = getLogger(["app"])

export type { Logger } from "@logtape/logtape"
export { getLogger } from "@logtape/logtape"
