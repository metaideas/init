import { Button } from "@init/ui/components/button"
import { FieldGroup } from "@init/ui/components/field"
import { useForm } from "@init/ui/components/form"
import { toast } from "@init/ui/components/sonner"
import { Link, useNavigate } from "@tanstack/react-router"
import { AUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { SignInWithPasswordFormSchema as schema } from "#features/auth/validation.ts"
import { signIn } from "#shared/auth.ts"

export default function SignInWithPasswordForm() {
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await signIn.email(
        { email: value.email, password: value.password },
        {
          onError: (error) => {
            toast.error(error.error.message, { position: "bottom-center" })
          },
          onSuccess: () => {
            void navigate({ to: AUTHENTICATED_PATHNAME })
          },
        }
      )
    },
    validators: { onSubmit: schema },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField name="email" validators={{ onBlur: schema.shape.email }}>
            {(field) => (
              <field.Field>
                <field.Label>Email address</field.Label>
                <field.Input autoComplete="email" type="email" />

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>
          <form.AppField name="password" validators={{ onBlur: schema.shape.password }}>
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
