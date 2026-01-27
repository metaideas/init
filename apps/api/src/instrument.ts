import { configureLoggerAsync } from "@init/observability/logger"
import { initializeErrorMonitoring } from "@init/observability/monitoring/server"

void configureLoggerAsync()

initializeErrorMonitoring()
