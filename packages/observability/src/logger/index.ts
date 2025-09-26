import { isDevelopment } from "@init/utils/environment"
import pino, { type LoggerOptions } from "pino"

const options: LoggerOptions = {
  level: isDevelopment() ? "debug" : "info",
  redact: {
    paths: [
      "password",
      "secret",
      "*.secret",
      "*.password",
      "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
}

if (isDevelopment()) {
  options.transport = {
    target: "pino-pretty",
    options: { colorize: true },
  }
}

export const logger = pino(options)

export { default as styles } from "chalk"
export type { Logger } from "pino"
