"use client"

import * as Sentry from "@sentry/nextjs"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { sentryNextjs } from "@init/utils/env/presets"

import { MONITORING_SAMPLE_RATE } from "../config"

export function initializeErrorMonitoring() {
  const env = sentryNextjs()

  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: MONITORING_SAMPLE_RATE,

    replaysOnErrorSampleRate: 1,

    replaysSessionSampleRate: MONITORING_SAMPLE_RATE,

    sendDefaultPii: true,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      Sentry.browserTracingIntegration(), // Added for performance monitoring
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}

export function useReportError(error: Error) {
  const pathname = usePathname()

  useEffect(() => {
    captureException(error, {
      data: {
        pathname,
      },
    })
  }, [error, pathname])
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const withScope = Sentry.withScope
export const captureRequestError = Sentry.captureRequestError
export const captureRouterTransitionStart = Sentry.captureRouterTransitionStart
