import createNextIntlMiddleware from "next-intl/middleware"
import type { NextRequest, NextResponse } from "next/server"

import { routing } from "./"

const nextIntlMiddleware = createNextIntlMiddleware(routing)

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
