import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import env from "~/shared/env"

// Define the plugins outside of the auth function to avoid type inference issues
const plugins = [admin(), organization()]

export type Auth = ReturnType<typeof createAuth<typeof plugins>>

// We add a type annotation to the auth function to avoid type inference issues
// during type generation
export const auth: Auth = createAuth(
  databaseAdapter(database),
  {
    basePath: "/auth",
    secret: env.AUTH_SECRET,
    baseURL: env.BASE_URL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
  },
  plugins
)

export type Session = Auth["$Infer"]["Session"]
