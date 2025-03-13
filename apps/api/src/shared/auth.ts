import { createAuth } from "@this/auth/server"
import { admin, organization } from "@this/auth/server/plugins"

import env from "~/shared/env"

// biome-ignore lint/suspicious/noExplicitAny: Hack to get the admin plugin working
type AdminPlugin = ReturnType<typeof admin<any>>
type OrganizationPlugin = ReturnType<typeof organization>

// !HACK(adelrodriguez): This is a workaround to allow us to build the types for
// the client, otherwise we get a "A type annotation is necessary" error. See
// this issue for more details:
// https://github.com/better-auth/better-auth/issues/1391
type Auth = ReturnType<typeof createAuth<[AdminPlugin, OrganizationPlugin]>>

export const auth: Auth = createAuth(
  {
    basePath: "/auth",
    baseURL: env.BASE_URL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  [admin(), organization()]
)

export type Session = typeof auth.$Infer.Session
