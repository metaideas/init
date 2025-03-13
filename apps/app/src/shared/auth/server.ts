import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

import { createAuth } from "@this/auth/server"
import { admin, nextCookies, organization } from "@this/auth/server/plugins"

import env from "~/shared/env"

export const auth = createAuth(
  {
    basePath: "/api/auth",
    baseURL: env.VERCEL_URL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    socialProviders: {
      google: {
        enabled: true,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        enabled: true,
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
  },
  [admin(), organization(), nextCookies()]
)

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session

export const validateRequest = cache(async (): Promise<Session | null> => {
  const result = await auth.api.getSession({
    headers: await headers(),
  })

  if (!result) {
    return null
  }

  return result
})
