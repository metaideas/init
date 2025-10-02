import { isDevelopment } from "@init/utils/environment"
import pino, { type LoggerOptions } from "pino"

const options: LoggerOptions = {
  level: isDevelopment() ? "debug" : "info",
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
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
  ...(isDevelopment() && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        messageFormat: true,
        hideObject: false,
        singleLine: false,
      },
    },
  }),
}

export const logger = pino(options)

export { default as styles } from "chalk"
export type { Logger } from "pino"
