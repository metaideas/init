// Authentication errors
export type AuthenticationError = {
  "AUTH.UNAUTHENTICATED": { requestId?: string }
  "AUTH.UNAUTHORIZED": { requestId?: string; userId?: string }
}
