import { createAuth } from "@init/auth/server"
import { admin } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import env from "~/shared/env"

const plugins = [admin()]

// !HACK(adelrodriguez): This is a workaround to allow us to build the types for
// the client, otherwise we get a "A type annotation is necessary" error. See
// this issue for more details:
// https://github.com/better-auth/better-auth/issues/1391
export type Auth = ReturnType<typeof createAuth<typeof plugins>>

export const auth: Auth = createAuth(
  {
    basePath: "/auth",
    secret: env.AUTH_SECRET,
    baseURL: env.BASE_URL,
    database: database(),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  plugins
)

export type Session = typeof auth.$Infer.Session
