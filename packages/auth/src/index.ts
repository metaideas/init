import { db } from "@this/db/client"
import env from "@this/env/auth/server"
import { kv } from "@this/kv"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, organization } from "better-auth/plugins"

import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "#permissions.ts"
import { sendInvitationEmail } from "#utils/email.tsx"
import { hashPassword, verifyPassword } from "#utils/password.ts"

export const auth = betterAuth({
  baseUrl: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  advanced: {
    // We rely on ids generated by the database
    generateId: false,
  },
  user: {
    additionalFields: {
      publicId: {
        type: "string",
        required: false,
        input: false,
        fieldName: "public_id",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 15,
    additionalFields: {
      publicId: {
        type: "string",
        required: false,
        input: false,
        fieldName: "public_id",
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        before: async ({ accountId, ...rest }) => ({
          data: {
            ...rest,
            // Relying on JavaScript parsing of numbers to strings rather than
            // the database's
            accountId: accountId.toString(),
          },
        }),
      },
    },
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
  ],
  secondaryStorage: {
    get: key => kv.get(key),
    set: (key, value, ttl) =>
      ttl
        ? kv.set(key, JSON.stringify(value), { ex: ttl })
        : kv.set(key, JSON.stringify(value)),
    delete: async key => {
      await kv.del(key)
    },
  },
})

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session
