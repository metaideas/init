"use client"

import {
  createLogger,
  createUseLogger,
  createWebVitalsComponent,
} from "@init/observability/logger/react"
import env from "~/shared/env"

export const logger = createLogger(
  env.NEXT_PUBLIC_AXIOM_TOKEN,
  env.NEXT_PUBLIC_AXIOM_DATASET,
  { nextjs: true }
)

export const useLogger = createUseLogger(logger)
export const WebVitals = createWebVitalsComponent(logger)
