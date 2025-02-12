"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@this/auth/server"

import {
  SignInWithPasswordSchema,
  SignUpSchema,
} from "~/features/auth/validation"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"
import { actionClient, withRateLimitByIp } from "~/shared/safe-action"

export const signUp = actionClient
  .metadata({ actionName: "auth.signUp" })
  .use(withRateLimitByIp(10, "60 s"))
  .schema(SignUpSchema)
  .action(async ({ parsedInput: { email, password, name }, ctx }) => {
    const { user } = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })

    ctx.log.info("Created user", { user })

    // Here you can redirect to the dashboard or an onboarding page where they
    // can create their first organization
    redirect(AUTHORIZED_PATHNAME)
  })

export const signInWithPassword = actionClient
  .metadata({ actionName: "auth.signInWithPassword" })
  .schema(SignInWithPasswordSchema)
  .action(async ({ parsedInput: { email, password }, ctx }) => {
    const { user } = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })

    ctx.log.info("Signed in with password", { user })

    redirect(AUTHORIZED_PATHNAME)
  })
