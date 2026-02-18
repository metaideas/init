import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { APP_ID, APP_NAME } from "@init/utils/constants"
import { seconds } from "qte"
import env from "#shared/env.ts"

export const auth = createAuth({
  advanced: {
    cookiePrefix: APP_ID,
    database: { generateId: false },
  },
  appName: APP_NAME,
  basePath: "/auth",
  baseURL: env.BASE_URL,
  database: databaseAdapter(database()),
  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
  },
  plugins: [admin(), organization()],
  secret: env.AUTH_SECRET,
  session: {
    expiresIn: seconds("30d"),
    updateAge: seconds("15d"),
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      enabled: true,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: true,
    },
  },
  trustedOrigins: env.ALLOWED_API_ORIGINS,
})

export type Auth = typeof auth
export type Session = Auth["$Infer"]["Session"]
