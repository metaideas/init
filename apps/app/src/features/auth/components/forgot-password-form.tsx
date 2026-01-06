import { FieldGroup } from "@init/ui/components/field"
import { useForm } from "@init/ui/components/form"
import { toast } from "@init/ui/components/sonner"
import { useServerFn } from "@tanstack/react-start"
import { forgotPassword } from "#features/auth/server/functions.ts"
import { ForgotPasswordFormSchema as schema } from "#features/auth/validation.ts"

export default function ForgotPasswordForm() {
  const execute = useServerFn(forgotPassword)
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await execute({
        data: { email: value.email },
      })

      toast.success("Password reset link sent to your email", {
        position: "bottom-center",
      })

      form.reset()
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
          <form.AppField name="email" validators={{ onBlur: schema.shape.email }}>
            {(field) => (
              <field.Field>
                <field.Label>Email address</field.Label>
                <field.Input autoComplete="email" type="email" />

                <field.Error errors={field.state.meta.errors} />
              </field.Field>
            )}
          </form.AppField>

          <form.ServerError />
          <form.Submit className="w-full" loadingText="Sending reset link...">
            Send reset link
          </form.Submit>
        </FieldGroup>
      </form.AppForm>
    </form>
  )
}
