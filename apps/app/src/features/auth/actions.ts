"use server"

import { flattenValidationErrors } from "next-safe-action"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { slidingWindow } from "@init/security/ratelimit"
import { z } from "@init/utils/schema"

import {
  SignInWithPasswordFormSchema,
  SignUpFormSchema,
} from "~/features/auth/validation"
import { auth } from "~/shared/auth/server"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"
import { actionClient, withRateLimitByIp } from "~/shared/safe-action"

export const checkEmailAvailability = actionClient
  .metadata({ name: "auth.checkEmailAvailability" })
  .schema(z.object({ email: z.string().email() }))
  .action(async ({ parsedInput: { email }, ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    return { available: !user }
  })

export const signUp = actionClient
  .metadata({ name: "auth.signUp" })
  .use(withRateLimitByIp("auth.signUp", slidingWindow(10, "60 s")))
  .schema(SignUpFormSchema, {
    handleValidationErrorsShape: async errors =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password, name }, ctx }) => {
    const { user } = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })

    ctx.logger.info("Created user", { user })

    // Here you can redirect to the dashboard or an onboarding page where they
    // can create their first organization
    redirect(AUTHORIZED_PATHNAME)
  })

export const signInWithPassword = actionClient
  .metadata({ name: "auth.signInWithPassword" })
  .schema(SignInWithPasswordFormSchema, {
    handleValidationErrorsShape: async errors =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password }, ctx }) => {
    const { user } = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })

    ctx.logger.info("Signed in with password", { user })

    redirect(AUTHORIZED_PATHNAME)
  })
