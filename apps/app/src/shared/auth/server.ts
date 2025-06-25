import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

import { nextCookies } from "@init/auth/nextjs"
import { createAuth } from "@init/auth/server"
import { database } from "@init/db/client"

import env from "~/shared/env"

export const auth = createAuth(
  {
    secret: env.AUTH_SECRET,
    baseURL: env.BASE_URL,
    database: database(),
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
  [nextCookies()]
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
