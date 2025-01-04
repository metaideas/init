import { loggingMiddleware } from "@this/observability/logger/nextjs"
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server"

export function middleware(request: NextRequest, event: NextFetchEvent) {
  loggingMiddleware(request, event)

  return NextResponse.next()
}
