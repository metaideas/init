import { configureLogger } from "@init/observability/logger"
import { initializeErrorMonitoring } from "@init/observability/monitoring/expo"

configureLogger()
initializeErrorMonitoring()
