"use server"

import { flattenValidationErrors } from "next-safe-action"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { slidingWindow } from "@init/security/ratelimit"
import { Fault } from "@init/utils/fault"
import { tryCatch } from "@init/utils/try-catch"

import {
  SignInWithPasswordFormSchema,
  SignUpFormSchema,
} from "~/features/auth/validation"
import { publicAction, withRateLimitByIp } from "~/shared/action-client"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"

export const signUp = publicAction
  .metadata({ name: "auth.signUp" })
  .use(withRateLimitByIp("auth.signUp", slidingWindow(10, "60 s")))
  .schema(SignUpFormSchema, {
    handleValidationErrorsShape: async errors =>
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
  .schema(SignInWithPasswordFormSchema, {
    handleValidationErrorsShape: async errors =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password }, ctx }) => {
    const [data, error] = await tryCatch(
      ctx.auth.api.signInEmail({
        body: { email, password },
        headers: await headers(),
      })
    )

    if (error) {
      throw Fault.from(error)
        .withTag("AUTHENTICATION_ERROR")
        .withDescription("Invalid credentials")
    }

    ctx.logger.info("Signed in with password", { user: data.user })

    redirect(AUTHORIZED_PATHNAME)
  })
