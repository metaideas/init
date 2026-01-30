import {
  type Config,
  type Logger as LogtapeLogger,
  configure,
  configureSync,
  getConsoleSink,
  getLogger as getLogtapeLogger,
  jsonLinesFormatter,
} from "@logtape/logtape"
import { getPrettyFormatter } from "@logtape/pretty"
import { isDevelopment } from "std-env"
import { redactSink } from "./utils"

export const LoggerCategory = {
  CONVEX: ["convex"],
  DEFAULT: ["default"],
  DRIZZLE_ORM: ["drizzle-orm"],
  HONO: ["hono"],
  INNGEST: ["inngest"],
  LOGTAPE: ["logtape", "meta"],
  SECURITY: ["security"],
} as const satisfies Record<string, string[]>

type LoggerCategoryType = (typeof LoggerCategory)[keyof typeof LoggerCategory]

type LoggerConfigOptions = {
  isDevelopment?: boolean
}

function buildConfig(nonBlocking: boolean, options?: LoggerConfigOptions): Config<string, string> {
  const isDev = options?.isDevelopment ?? isDevelopment
  const consoleSink = getConsoleSink({
    formatter: isDev
      ? getPrettyFormatter({
          categoryTruncate: "middle",
          categoryWidth: 15,
          levelStyle: "bold",
          messageStyle: "reset",
          properties: true,
          timestamp: "time",
        })
      : jsonLinesFormatter,
    nonBlocking,
  })

  return {
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
  }
}

export function configureLogger(options?: LoggerConfigOptions) {
  configureSync(buildConfig(false, options))
}

export async function configureLoggerAsync(options?: LoggerConfigOptions) {
  await configure(buildConfig(true, options))
}

export function getLogger(category: LoggerCategoryType = LoggerCategory.DEFAULT) {
  return getLogtapeLogger(category)
}

export const logger = getLogger()

export type Logger = LogtapeLogger
