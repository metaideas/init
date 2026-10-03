import { createCsrfMiddleware } from "@tanstack/react-start"

export const withCsrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
})

/**
 * CSRF check for route handlers that accept native form submissions. The global `withCsrf` only
 * covers server functions.
 */
export const withFormCsrf = createCsrfMiddleware()
