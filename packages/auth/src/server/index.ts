import { APP_ID, APP_NAME } from "@init/utils/constants"
import type { BetterAuthPlugin } from "better-auth"
import { type DB, drizzleAdapter } from "better-auth/adapters/drizzle"
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal"

const SESSION_EXPIRES_IN = 60 * 60 * 24 * 30 // 30 days
const SESSION_UPDATE_AGE = 60 * 60 * 24 * 15 // 15 days

export function createAuth<T extends BetterAuthPlugin[]>(
  database: BetterAuthOptions["database"],
  options: Omit<
    BetterAuthOptions,
    "appName" | "secret" | "database" | "session" | "plugins"
  > & { secret: string },
  plugins: T
) {
  return betterAuth({
    appName: APP_NAME,
    database,
    advanced: {
      cookiePrefix: APP_ID,
      ...options.advanced,
    },
    session: {
      expiresIn: SESSION_EXPIRES_IN,
      updateAge: SESSION_UPDATE_AGE,
    },
    plugins,
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
