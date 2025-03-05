import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { csrfProtectionMiddleware } from "~/shared/middlewares"

export function middleware(request: NextRequest) {
  const crsfProtectionResult = csrfProtectionMiddleware(request)

  if (crsfProtectionResult) {
    return crsfProtectionResult
  }

  return NextResponse.next()
}
