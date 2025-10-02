import {
  createLogger,
  createUseLogger,
  createWebVitalsComponent,
} from "@init/observability/logger/client"
import env from "~/shared/env"

export const logger = createLogger(
  env.PUBLIC_AXIOM_TOKEN,
  env.PUBLIC_AXIOM_DATASET
)

export const useLogger = createUseLogger(logger)
export const WebVitals = createWebVitalsComponent(logger)
