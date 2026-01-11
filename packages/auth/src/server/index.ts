import { type DB, drizzleAdapter } from "better-auth/adapters/drizzle"

export function databaseAdapter(database: DB) {
  return drizzleAdapter(database, {
    // By default, we use PostgreSQL. Change this to another provider if needed.
    provider: "pg",
    usePlural: true,
  })
}

export { APIError as AuthError } from "better-auth/api"
export {
  betterAuth as createAuth,
  type BetterAuthOptions as AuthOptions,
} from "better-auth/minimal"
