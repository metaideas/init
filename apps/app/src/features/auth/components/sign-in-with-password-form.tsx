import { Button } from "@init/ui/components/button"
import { useAppForm } from "@init/ui/components/form"
import { toast } from "@init/ui/components/sonner"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  AUTHENTICATED_PATHNAME,
  UNAUTHENTICATED_PATHNAME,
} from "~/features/auth/constants"
import { SignInWithPasswordFormSchema as schema } from "~/features/auth/validation"
import { signIn } from "~/shared/auth/client"

export default function SignInWithPasswordForm() {
  const navigate = useNavigate()
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
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
  })

  return (
    <form
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.AppForm>
        <form.AppField name="email" validators={{ onBlur: schema.shape.email }}>
          {(field) => (
            <field.Item>
              <field.Label>Email address</field.Label>
              <field.Control>
                <field.Input autoComplete="email" type="email" />
              </field.Control>

              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{ onBlur: schema.shape.password }}
        >
          {(field) => (
            <field.Item>
              <field.Label>Password</field.Label>
              <field.Control>
                <field.Input autoComplete="current-password" type="password" />
              </field.Control>
              <field.Message />
              <Button asChild className="p-0" variant="link">
                <Link to={UNAUTHENTICATED_PATHNAME}>Forgot password?</Link>
              </Button>
            </field.Item>
          )}
        </form.AppField>
        <form.ServerError title="Form Error" />
        <form.SubmitButton className="w-full" loadingText="Signing in...">
          Sign in
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
