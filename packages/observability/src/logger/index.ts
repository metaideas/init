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
  EMAIL: ["email"],
  HONO: ["hono"],
  INNGEST: ["inngest"],
  LOGTAPE: ["logtape", "meta"],
} as const satisfies Record<string, string[]>

type LoggerCategoryType = (typeof LoggerCategory)[keyof typeof LoggerCategory]

type BuildLoggerOptions = {
  async?: boolean
  isDevelopment?: boolean
}

const LOGGER_CONFIGS = [
  {
    category: LoggerCategory.LOGTAPE,
    lowestLevel: "warning",
    sinks: ["meta"],
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
    category: LoggerCategory.EMAIL,
    lowestLevel: "info",
    sinks: ["console"],
  },
  {
    category: LoggerCategory.DEFAULT,
    lowestLevel: "trace",
    sinks: ["console"],
  },
] as const satisfies Config<string, string>["loggers"]

export function buildLogger(
  categories: readonly LoggerCategoryType[],
  options?: BuildLoggerOptions
) {
  if (categories.length === 0) {
    throw new Error("At least one logger category is required")
  }

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
    nonBlocking: options?.async === true,
  })

  const configuredCategories = new Set(categories.map((category) => category.join("/")))

  const config: Config<string, string> = {
    loggers: LOGGER_CONFIGS.filter((logger) => configuredCategories.has(logger.category.join("/"))),
    sinks: {
      console: redactSink(consoleSink),
      meta: consoleSink,
    },
  }

  if (options?.async) {
    void configure(config)
  } else {
    configureSync(config)
  }

  const defaultCategoryKey = LoggerCategory.DEFAULT.join("/")
  const defaultCategory = categories.find((category) => category.join("/") === defaultCategoryKey)

  return getLogger(defaultCategory ?? categories[0])
}

export function getLogger(category: LoggerCategoryType = LoggerCategory.DEFAULT) {
  return getLogtapeLogger(category)
}

export type Logger = LogtapeLogger
