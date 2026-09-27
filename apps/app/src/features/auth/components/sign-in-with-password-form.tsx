import { Button } from "@init/ui/components/button"
import { FieldGroup } from "@init/ui/components/field"
import { useForm } from "@init/ui/components/form"
import { toast } from "@init/ui/components/toast"
import { mergeForm, useTransform } from "@tanstack/react-form-start"
import { Link, useNavigate } from "@tanstack/react-router"
import { AUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { type FormErrorState, signInWithPasswordFormOptions } from "#features/auth/forms.ts"
import { signInWithPassword } from "#features/auth/server/functions.ts"
import { EmailSchema, PasswordSchema } from "#features/auth/validation.ts"
import { signIn } from "#shared/auth.ts"

/**
 * Posts natively to `signInWithPassword` until hydration. After that, it validates and signs in on
 * the client. `state` holds the errors from a failed native submission.
 */
export default function SignInWithPasswordForm({ state }: { state: FormErrorState | null }) {
  const navigate = useNavigate()
  const form = useForm({
    ...signInWithPasswordFormOptions,
    onSubmit: async ({ value }) => {
      await signIn.email(value, {
        onError: (error) => {
          toast.add({ title: error.error.message, type: "error" })
        },
        onSuccess: () => {
          void navigate({ to: AUTHENTICATED_PATHNAME })
        },
      })
    },
    transform: useTransform((baseForm) => (state ? mergeForm(baseForm, state) : baseForm), [state]),
  })

  return (
    <form
      action={signInWithPassword.url}
      encType="multipart/form-data"
      method="post"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField name="email" validators={{ onBlur: EmailSchema }}>
            {(field) => (
              <field.Field>
                <field.Label>Email address</field.Label>
                <field.Input autoComplete="email" type="email" />

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>
          <form.AppField name="password" validators={{ onBlur: PasswordSchema }}>
            {(field) => (
              <field.Field>
                <field.Label>Password</field.Label>
                <field.Input autoComplete="current-password" type="password" />
                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>

          <form.ServerError />
          <form.Submit className="w-full" loadingText="Signing in...">
            Sign in
          </form.Submit>
          <div className="flex w-full justify-center">
            <Button variant="link">
              <Link to="/forgot-password">Forgot password?</Link>
            </Button>
          </div>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
