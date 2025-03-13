import { createAuth } from "@this/auth/server"
import { admin } from "@this/auth/server/plugins"

import env from "~/shared/env"

export const auth = createAuth(
  {
    basePath: "/auth",
    baseURL: env.BASE_URL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  [admin()]
)

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session
