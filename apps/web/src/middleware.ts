import { i18nMiddleware } from "@init/internationalization/nextjs/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { csrfProtectionMiddleware } from "~/shared/middlewares"

export function middleware(request: NextRequest) {
  const crsfProtectionResult = csrfProtectionMiddleware(request)

  if (crsfProtectionResult) {
    return crsfProtectionResult
  }

  const i18nResult = i18nMiddleware(request)

  if (i18nResult) {
    return i18nResult
  }

  return NextResponse.next()
}
