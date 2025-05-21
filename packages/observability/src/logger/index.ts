import pino from "pino"
import pretty from "pino-pretty"

import { isDevelopment } from "@init/utils/environment"

/**
 * This is the default logger to be used in other packages. For applications,
 * use the respective logger for the environment.
 */
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

export { default as styles } from "chalk"
