import createNextIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { isDevelopment } from "@this/utils/environment"

import { routing } from "~/shared/i18n/routing"

const nextIntlMiddleware = createNextIntlMiddleware(routing)

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

// This regex matches any path that is not an API route, not a Next.js internal
// route, and does not end with a file extension.
const I18N_PATH_REGEX = /^(?!\/(?:api\/|_next\/|_vercel\/)).*(?<!\.[\w]+)$/

export function i18nMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  if (I18N_PATH_REGEX.test(pathname)) {
    return nextIntlMiddleware(request)
  }

  return null
}
