import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

import { loggingMiddleware } from "@this/observability/logger/nextjs"

import { csrfProtectionMiddleware, i18nMiddleware } from "~/lib/middlewares"

export function middleware(request: NextRequest, event: NextFetchEvent) {
  loggingMiddleware(request, event)

  const crsftProtectionResult = csrfProtectionMiddleware(request)

  if (crsftProtectionResult) {
    return crsftProtectionResult
  }

  const i18nResult = i18nMiddleware(request)

  if (i18nResult) {
    return i18nResult
  }

  return NextResponse.next()
}
