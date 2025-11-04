import { isDevelopment } from "@init/utils/environment"
import pino, { type LoggerOptions } from "pino"

const options: LoggerOptions = {
  level: "info",
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.errWithCause,
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
}

if (isDevelopment()) {
  options.level = "debug"
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      messageFormat: true,
      hideObject: false,
      singleLine: false,
    },
  }
}

export const logger = pino(options)

export type { Logger } from "pino"
