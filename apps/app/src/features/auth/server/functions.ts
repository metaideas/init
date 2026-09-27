import { AuthError } from "@init/auth/server"
import { PasswordResetRequestError } from "@init/core/errors"
import * as z from "@init/utils/schema/mini"
import { createServerValidate, ServerValidateError } from "@tanstack/react-form-start"
import { redirect } from "@tanstack/react-router"
import { createIsomorphicFn, createServerFn } from "@tanstack/react-start"
import { deleteCookie, getCookie, getRequestHeaders, setCookie } from "@tanstack/react-start/server"
import { AUTHENTICATED_PATHNAME, UNAUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import {
  FieldErrorsSchema,
  type FormErrorState,
  FormErrorStateSchema,
  signInWithPasswordFormOptions,
} from "#features/auth/forms.ts"
import { auth } from "#features/auth/server/index.ts"
import { EmailSchema, SignInWithPasswordFormSchema } from "#features/auth/validation.ts"
import { authClient } from "#shared/auth.ts"
import { publicFunction } from "#shared/server/functions.ts"
import { withLogger } from "#shared/server/middleware.ts"
import { buildUrl } from "#shared/utils.ts"

const SIGN_IN_FORM_STATE_COOKIE = "sign-in-form-state"
// `createServerValidate()` stores failed submissions, including passwords, in this cookie.
const FORM_ADAPTER_COOKIE = "_tanstack_form_internals"

const ServerValidationErrorSchema = z.object({ fields: FieldErrorsSchema })

const validateSignInWithPasswordForm = createServerValidate({
  ...signInWithPasswordFormOptions,
  onServerValidate: SignInWithPasswordFormSchema,
})

export const validateSession = createIsomorphicFn()
  .client(async () => {
    const { data: session } = await authClient.getSession()
    return session
  })
  .server(async () => {
    const { data: session } = await authClient.getSession({
      fetchOptions: { headers: getRequestHeaders() },
    })
    return session
  })

export const checkEmailAvailability = publicFunction
  .validator(z.object({ email: EmailSchema }))
  .handler(async ({ context, data }) => {
    const user = await context.database.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
    })

    return { isAvailable: !user }
  })

export const forgotPassword = publicFunction
  .validator(z.object({ email: EmailSchema }))
  .handler(async ({ data }) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      fetchOptions: { headers: getRequestHeaders() },
      redirectTo: buildUrl("/reset-password"),
    })

    if (error) {
      throw new PasswordResetRequestError().withMessage(
        error.message ?? "Unable to request a password reset"
      )
    }
    return { success: true }
  })

/**
 * Native form target for the sign-in form, so it works without JavaScript. Failures redirect back
 * to the form with a redacted error state that `getSignInFormState` reads once. Redirects use 303
 * so the browser follows them with a GET instead of resubmitting the credentials.
 */
export const signInWithPassword = createServerFn({ method: "POST" })
  .middleware([withLogger])
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new TypeError("Expected form data")
    }

    return data
  })
  .handler(async ({ data }) => {
    const errorState = await signInWithFormData(data)

    if (errorState) {
      setCookie(SIGN_IN_FORM_STATE_COOKIE, JSON.stringify(errorState), {
        httpOnly: true,
        maxAge: 60,
        sameSite: "lax",
      })

      // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects use thrown control-flow objects.
      throw redirect({ statusCode: 303, to: UNAUTHENTICATED_PATHNAME })
    }

    // oxlint-disable-next-line typescript/only-throw-error -- TanStack Router redirects use thrown control-flow objects.
    throw redirect({ statusCode: 303, to: AUTHENTICATED_PATHNAME })
  })

export const getSignInFormState = createServerFn().handler(() => {
  const cookie = getCookie(SIGN_IN_FORM_STATE_COOKIE)

  if (!cookie) {
    return null
  }

  deleteCookie(SIGN_IN_FORM_STATE_COOKIE)

  return parseFormErrorState(cookie)
})

async function signInWithFormData(formData: FormData): Promise<FormErrorState | null> {
  let credentials: z.infer<typeof SignInWithPasswordFormSchema>

  try {
    // The adapter returns the decoded form input untyped, so parse it again at this boundary.
    credentials = SignInWithPasswordFormSchema.parse(await validateSignInWithPasswordForm(formData))
  } catch (error) {
    if (!(error instanceof ServerValidateError)) {
      throw error
    }

    deleteCookie(FORM_ADAPTER_COOKIE)

    const { fields } = ServerValidationErrorSchema.parse(error.formState.errorMap.onServer)

    return { errorMap: { onServer: { fields } } }
  }

  try {
    await auth.api.signInEmail({ body: credentials, headers: getRequestHeaders() })
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error
    }

    return { errorMap: { onServer: { fields: {}, form: error.message } } }
  }

  return null
}

function parseFormErrorState(value: string) {
  try {
    return FormErrorStateSchema.parse(JSON.parse(value))
  } catch {
    return null
  }
}
