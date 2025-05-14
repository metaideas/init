import { createAuth } from "@init/auth/server"
import { adminPlugin, organizationPlugin } from "@init/auth/server/plugins"

import env from "~/shared/env"

// !HACK(adelrodriguez): This is a workaround to allow us to build the types for
// the client, otherwise we get a "A type annotation is necessary" error. See
// this issue for more details:
// https://github.com/better-auth/better-auth/issues/1391
type Auth = ReturnType<
  typeof createAuth<
    [
      // See above. If you add any plugins, make sure to add them here as well.
      typeof adminPlugin,
      typeof organizationPlugin,
    ]
  >
>

export const auth: Auth = createAuth(
  {
    basePath: "/auth",
    baseURL: env.BASE_URL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  [adminPlugin, organizationPlugin]
)

export type Session = typeof auth.$Infer.Session
