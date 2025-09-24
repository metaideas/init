import type { database as databaseFn } from "@init/db/client"
import { APP_ID, APP_NAME } from "@init/utils/constants"
import {
  type BetterAuthOptions,
  type BetterAuthPlugin,
  betterAuth,
} from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 30 // 30 days
const SESSION_UPDATE_AGE = 60 * 60 * 24 * 15 // 15 days

export function createAuth<T>(
  database: BetterAuthOptions["database"],
  options: Omit<
    BetterAuthOptions,
    "appName" | "secret" | "database" | "session" | "plugins"
  > & { secret: string },
  plugins: T extends BetterAuthPlugin[] ? T : never
) {
  const { advanced, ...rest } = options

  return betterAuth({
    appName: APP_NAME,
    database,
    advanced: {
      ...advanced,
      database: {
        // We rely on the database to generate ids
        generateId: false,
      },
      cookiePrefix: APP_ID,
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN,
      updateAge: SESSION_UPDATE_AGE,
    },
    plugins,
    ...rest,
  })
}

export function databaseAdapter(database: typeof databaseFn) {
  return drizzleAdapter(database(), {
    // By default, we use PostgreSQL. Change this to another provider if needed.
    provider: "pg",
    usePlural: true,
  })
}

export { APIError as AuthError } from "better-auth/api"
