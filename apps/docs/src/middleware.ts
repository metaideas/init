import { i18nMiddleware } from "~/lib/middlewares"

const middleware = i18nMiddleware

export default middleware

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
