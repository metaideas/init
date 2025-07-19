"use server"

import { slidingWindow } from "@init/security/ratelimit"
import { generateNoLookalikeId } from "@init/utils/id"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { flattenValidationErrors } from "next-safe-action"
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

    ctx.logger.info({ user }, "Created user")

    const organization = await ctx.auth.api.createOrganization({
      body: {
        name: "My Personal Workspace",
        slug: `workspace-${generateNoLookalikeId(12)}`,
        userId: user.id,
      },
    })

    ctx.logger.info({ organization }, "Created organization")

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

    ctx.logger.info({ user }, "Signed in with password")

    redirect(AUTHORIZED_PATHNAME)
  })
