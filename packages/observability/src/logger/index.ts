import { isDevelopment } from "@init/utils/environment"
import { configureSync, getConsoleSink, getLogger, jsonLinesFormatter } from "@logtape/logtape"
import { getPrettyFormatter } from "@logtape/pretty"
import { redactSink } from "./utils"

const consoleSink = getConsoleSink({
  formatter: isDevelopment()
    ? getPrettyFormatter({
        timestamp: "time",
        properties: true,
        categoryWidth: 15,
        levelStyle: "bold",
        messageStyle: "reset",
        categoryTruncate: "middle",
      })
    : jsonLinesFormatter,
  nonBlocking: true,
})

configureSync({
  sinks: {
    console: redactSink(consoleSink),
    meta: consoleSink,
  },
  loggers: [
    {
      category: ["logtape", "meta"],
      sinks: ["meta"],
      lowestLevel: "warning",
    },
    {
      category: ["security"],
      sinks: ["console"],
      lowestLevel: "info",
    },
    {
      category: ["hono"],
      sinks: ["console"],
      lowestLevel: "info",
    },
    {
      category: ["drizzle-orm"],
      sinks: ["console"],
      lowestLevel: "debug",
    },
    {
      category: ["default"],
      sinks: ["console"],
      lowestLevel: "trace",
    },
  ],
})

export const logger = getLogger(["app"])

export type { Logger } from "@logtape/logtape"
export { getLogger } from "@logtape/logtape"
