import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isDevelopment } from "@this/utils/environment"

export function csrfProtectionMiddleware(request: NextRequest) {
  if (isDevelopment) {
    return null
  }

  if (request.method !== "GET") {
    const originHeader = request.headers.get("Origin")
    const hostHeader = request.headers.get("Host")

    if (originHeader === null || hostHeader === null) {
      return new NextResponse(null, {
        status: 403,
      })
    }

    let origin: URL

    try {
      origin = new URL(originHeader)
    } catch {
      return new NextResponse(null, {
        status: 403,
      })
    }

    if (origin.host !== hostHeader) {
      return new NextResponse(null, {
        status: 403,
      })
    }
  }

  return null
}
