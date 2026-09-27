import { AuthError } from "@init/auth/server"
import * as z from "@init/utils/schema/mini"
import { AUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { auth } from "#features/auth/server/index.ts"
import { SignInWithPasswordFormSchema } from "#features/auth/validation.ts"

/**
 * Form state for a rejected native submission, shaped for TanStack Form's `mergeForm`. It keeps the
 * email so the page can render it again, and never the password.
 */
export type SignInFormState = {
  errorMap: {
    onServer: string | { fields: Record<string, Array<{ message: string }>> }
  }
  values: { email: string; password: string }
}

/**
 * Signs in from a native form submission. Returns a redirect on success, or the form state to
 * render the page again with errors.
 */
export async function signInWithPasswordForm(
  request: Request
): Promise<{ response: Response } | { formState: SignInFormState }> {
  const formData = await request.formData()
  const email = formData.get("email")
  const values = { email: typeof email === "string" ? email : "", password: "" }
  const result = SignInWithPasswordFormSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error)
    const fields = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        messages.map((message) => ({ message })),
      ])
    )

    return { formState: { errorMap: { onServer: { fields } }, values } }
  }

  try {
    // The TanStack Start cookie plugin adds the session cookies to this response.
    await auth.api.signInEmail({ body: result.data, headers: request.headers })

    return {
      response: new Response(null, { headers: { Location: AUTHENTICATED_PATHNAME }, status: 303 }),
    }
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error
    }

    return { formState: { errorMap: { onServer: error.message }, values } }
  }
}
