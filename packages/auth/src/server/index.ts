import type { BetterAuthPlugin } from "better-auth"
import { APP_ID, APP_NAME } from "@init/utils/constants"
import { type DB, drizzleAdapter } from "better-auth/adapters/drizzle"
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal"

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 30 // 30 days
const SESSION_UPDATE_AGE = 60 * 60 * 24 * 15 // 15 days

export function createAuth<T extends BetterAuthPlugin[]>(
  database: BetterAuthOptions["database"],
  options: Omit<BetterAuthOptions, "appName" | "secret" | "database" | "session" | "plugins"> & {
    secret: string
  },
  plugins: T
) {
  return betterAuth({
    advanced: {
      cookiePrefix: APP_ID,
      ...options.advanced,
    },
    appName: APP_NAME,
    database,
    plugins,
    session: {
      expiresIn: SESSION_EXPIRES_IN,
      updateAge: SESSION_UPDATE_AGE,
    },
    ...options,
  })
}

export function databaseAdapter(database: DB) {
  return drizzleAdapter(database, {
    // By default, we use PostgreSQL. Change this to another provider if needed.
    provider: "pg",
    usePlural: true,
  })
}

export { APIError as AuthError } from "better-auth/api"
