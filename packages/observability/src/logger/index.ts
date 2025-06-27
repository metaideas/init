import { isDevelopment } from "@init/utils/environment"
import pino from "pino"
import pretty from "pino-pretty"

export const logger = pino(
  {
    level: isDevelopment ? "debug" : "info",
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
  },
  pretty({ colorize: true })
)

export type Logger = pino.Logger

export { default as styles } from "chalk"
