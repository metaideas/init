/**
 * Better Auth helpers for wide events: `identifyUser` stamps the session's
 * user onto a request logger, `createAuthMiddleware` resolves sessions from
 * headers, and `maskEmail` redacts addresses for safe logging.
 */
export { createAuthMiddleware, identifyUser, maskEmail } from "evlog/better-auth"
