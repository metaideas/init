import { APP_ID, APP_NAME } from "@this/common/constants"
import { db } from "@this/db/client"
import env from "@this/env/auth.server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, organization } from "better-auth/plugins"

import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "#permissions.ts"
import { sendInvitationEmail } from "#utils/email.ts"
import { hashPassword, verifyPassword } from "#utils/password.ts"

export const auth = betterAuth({
  appName: APP_NAME,
  baseUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    // We use our own custom password hashing and verification functions to
    // allow portability into another hashing algorithm if needed.
    password: {
      hash: hashPassword,
      verify: async ({ hash, password }) => verifyPassword(password, hash),
    },
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  advanced: {
    // We rely on ids generated by the database
    generateId: false,
    cookiePrefix: APP_ID,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 15, // 15 days
  },
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
  plugins: [
    admin(),
    organization({
      ac: accessControl,
      roles: {
        member: memberRole,
        admin: adminRole,
        owner: ownerRole,
      },
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
      sendInvitationEmail,
    }),
    // Make sure this is the last plugin included
    ...(env.BETTER_AUTH_SERVER_ACTIONS ? [nextCookies()] : []),
  ],
})

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session

export { BetterAuthError } from "better-auth"
