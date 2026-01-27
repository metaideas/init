import { configureLoggerAsync } from "@init/observability/logger"
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server"

void configureLoggerAsync()

export default {
  fetch: createStartHandler(defaultStreamHandler),
}
