import type { AnyFieldLikeMetaBase } from "@tanstack/react-form-start"
import * as z from "@init/utils/schema/mini"
import { AUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { SignInWithPasswordFormSchema } from "#features/auth/validation.ts"
import { authClient } from "#shared/auth.ts"

// Request headers the auth server uses for its origin check, cookies, and session metadata.
const FORWARDED_HEADERS = ["cookie", "origin", "referer", "user-agent", "x-forwarded-for"]

/**
 * Form state for a rejected native submission, shaped for TanStack Form's `mergeForm`. It keeps the
 * email so the page can render it again, and never the password.
 */
export type SignInFormState = {
  errorMap: { onServer?: string }
  fieldMetaBase?: Record<string, AnyFieldLikeMetaBase>
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
    // Rejected fields are marked touched so the form renders them as invalid.
    const fieldMetaBase = Object.fromEntries(
      Object.entries(fieldErrors).map(([field, messages]) => [
        field,
        {
          _arrayVersion: 0,
          _pendingValidationsCount: 0,
          errorMap: { onServer: messages.map((message) => ({ message })) },
          errorSourceMap: { onServer: "form" },
          isBlurred: true,
          isDirty: true,
          isTouched: true,
          isValidating: false,
        } satisfies AnyFieldLikeMetaBase,
      ])
    )

    return { formState: { errorMap: {}, fieldMetaBase, values } }
  }

  let setCookies: string[] = []
  // Goes through the auth client, like `validateSession`, so the session belongs to whichever auth
  // server `PUBLIC_API_URL` selects. On a separate hostname, that server must scope its cookies to a
  // parent domain shared with this app (`AUTH_COOKIE_DOMAIN` in `apps/api`).
  const { error } = await authClient.signIn.email({
    ...result.data,
    fetchOptions: {
      headers: pickHeaders(request.headers, FORWARDED_HEADERS),
      onResponse: ({ response }) => {
        setCookies = response.headers.getSetCookie()
      },
    },
  })

  if (error) {
    return {
      formState: { errorMap: { onServer: error.message ?? "Unable to sign in" }, values },
    }
  }

  const response = new Response(null, {
    headers: { Location: AUTHENTICATED_PATHNAME },
    status: 303,
  })

  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie)
  }

  return { response }
}

function pickHeaders(headers: Headers, names: readonly string[]) {
  const picked = new Headers()

  for (const name of names) {
    const value = headers.get(name)

    if (value !== null) {
      picked.set(name, value)
    }
  }

  return picked
}
