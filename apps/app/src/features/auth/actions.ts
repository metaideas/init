"use server"

import { flattenValidationErrors } from "next-safe-action"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { slidingWindow } from "@init/security/ratelimit"

import {
  SignInWithPasswordFormDataSchema,
  SignUpFormDataSchema,
} from "~/features/auth/validation"
import { publicAction, withRateLimitByIp } from "~/shared/action-client"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"

export const signUp = publicAction
  .metadata({ name: "auth.signUp" })
  .use(withRateLimitByIp("auth.signUp", slidingWindow(10, "60 s")))
  .inputSchema(SignUpFormDataSchema, {
    handleValidationErrorsShape: async (errors) =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password, name }, ctx }) => {
    const { user } = await ctx.auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })

    ctx.logger.info("Created user", { user })

    // Here you can redirect to the dashboard or an onboarding page where they
    // can create their first organization
    redirect(AUTHORIZED_PATHNAME)
  })

export const signInWithPassword = publicAction
  .metadata({ name: "auth.signInWithPassword" })
  .inputSchema(SignInWithPasswordFormDataSchema, {
    handleValidationErrorsShape: async (errors) =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password }, ctx }) => {
    const { user } = await ctx.auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })

    ctx.logger.info("Signed in with password", { user })

    redirect(AUTHORIZED_PATHNAME)
  })
