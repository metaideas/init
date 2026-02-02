import { FieldGroup } from "@init/ui/components/field"
import { useForm } from "@init/ui/components/form"
import { useNavigate } from "@tanstack/react-router"
import { AUTHENTICATED_PATHNAME } from "#features/auth/constants.ts"
import { SignUpFormSchema as schema } from "#features/auth/validation.ts"
import { signUp } from "#shared/auth.ts"
import { useTRPCClient } from "#shared/trpc.ts"

export default function SignUpForm() {
  const trpcClient = useTRPCClient()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" },
    onSubmit: async ({ value }) => {
      await signUp.email(value, {
        onSuccess: () => {
          void navigate({ to: AUTHENTICATED_PATHNAME })
        },
      })
    },
    validators: {
      onSubmit: schema,
    },
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
          <form.AppField name="name" validators={{ onBlur: schema.shape.name }}>
            {(field) => (
              <field.Field>
                <field.Label>Name</field.Label>

                <field.Input autoComplete="name" type="text" />

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{
              onBlur: schema.shape.email,
              onBlurAsync: async ({ value }) => {
                const { isAvailable } = await trpcClient.auth.checks.emailAvailable.query({
                  email: value,
                })

                if (isAvailable) {
                  return
                }

                return { message: "Email is already in use" }
              },
            }}
          >
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
                <field.Input autoComplete="new-password" type="password" />
                <field.Description>At least 8 characters</field.Description>

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>
          <form.AppField
            name="confirmPassword"
            validators={{
              onBlur: schema.shape.confirmPassword.refine(
                (v) => v === form.getFieldValue("password"),
                {
                  message: "Passwords don't match",
                }
              ),
              onBlurListenTo: ["password"],
              onChangeListenTo: ["password"],
            }}
          >
            {(field) => (
              <field.Field>
                <field.Label>Confirm Password</field.Label>

                <field.Input autoComplete="new-password" type="password" />

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>
          <form.ServerError />
          <form.Submit className="w-full" loadingText="Signing up...">
            Sign up
          </form.Submit>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
