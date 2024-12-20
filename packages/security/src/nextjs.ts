import arcjet, { shield } from "@arcjet/next"
import env from "@this/env/security.server"

export const security = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
  ],
})

export { request, createMiddleware } from "@arcjet/next"
