import { LOCALES } from "@this/common/constants"
import createNextIntlMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { routing } from "~/lib/i18n/routing"

const nextIntlMiddleware = createNextIntlMiddleware(routing)

export function csrfProtectionMiddleware(request: NextRequest) {
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

export function i18nMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  if (new RegExp(`^/(${LOCALES.join("|")})(/.*)?$`).test(pathname)) {
    return nextIntlMiddleware(request)
  }

  return null
}
