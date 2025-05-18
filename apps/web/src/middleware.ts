import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { i18nMiddleware } from "@init/internationalization/nextjs/middleware"

import { csrfProtectionMiddleware } from "~/shared/middlewares"

export function middleware(request: NextRequest) {
  const crsfProtectionResult = csrfProtectionMiddleware(request)

  if (crsfProtectionResult) {
    return crsfProtectionResult
  }

  // @ts-expect-error - Small difference between request types in React 19.0.0
  // and 19.1.0. Should be resolved when upgrading to React 19.1.0
  const i18nResult = i18nMiddleware(request)

  if (i18nResult) {
    return i18nResult
  }

  return NextResponse.next()
}
