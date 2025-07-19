"use client"

import { useAppForm } from "@init/ui/components/form"
import { mergeForm, useTransform } from "@tanstack/react-form"
import { useActionState } from "react"
import { signUp } from "~/features/auth/actions"
import { SignUpFormSchema as schema } from "~/features/auth/validation"
import { useTRPCClient } from "~/shared/trpc/client"

export default function SignUpForm() {
  const trpcClient = useTRPCClient()
  const [state, action] = useActionState(signUp, {})

  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: {
      onSubmit: schema,
    },
    transform: useTransform(
      (baseForm) =>
        mergeForm(baseForm, { errorMap: { onServer: state.serverError } }),
      [state]
    ),
  })

  return (
    <form
      action={action}
      className="flex flex-col gap-y-4"
      onSubmit={() => form.handleSubmit()}
    >
      <form.AppForm>
        <form.AppField name="name" validators={{ onBlur: schema.shape.name }}>
          {(field) => (
            <field.Item>
              <field.Label>Name</field.Label>
              <field.Control>
                <field.Input autoComplete="name" type="text" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="email"
          validators={{
            onBlur: schema.shape.email,
            onBlurAsync: async ({ value }) => {
              const { isAvailable } =
                await trpcClient.auth.checkEmailAvailability.query({
                  email: value,
                })

              if (isAvailable) {
                return null
              }

              return { message: "Email is already in use" }
            },
          }}
        >
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
                <field.Input autoComplete="new-password" type="password" />
              </field.Control>
              <field.Message />
            </field.Item>
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
            <field.Item>
              <field.Label>Confirm Password</field.Label>
              <field.Control>
                <field.Input autoComplete="new-password" type="password" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.ServerError />
        <form.SubmitButton className="w-full" loadingText="Signing up...">
          Sign up
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
