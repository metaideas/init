"use client"

import { useAction } from "next-safe-action/hooks"

import { useAppForm } from "@this/ui/form"
import { toast } from "@this/ui/sonner"

import { signUp } from "~/features/auth/actions"
import { SignUpFormSchema } from "~/features/auth/validation"

export default function SignUpForm() {
  const action = useAction(signUp)
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: ({ value }) => {
        if (
          value.password &&
          value.confirmPassword &&
          value.password !== value.confirmPassword
        ) {
          return {
            fields: {
              confirmPassword: { message: "Passwords don't match" },
            },
          }
        }

        return null
      },
      onSubmit: SignUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await action.executeAsync(value)

      result?.validationErrors?._errors?.map(error => {
        toast.error(error)
      })

      result?.serverError && toast.error(result.serverError)
    },
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.AppForm>
        <form.AppField
          name="name"
          validators={{
            onBlur: SignUpFormSchema._def.schema.shape.name,
          }}
        >
          {field => (
            <field.Item>
              <field.Label>Name</field.Label>
              <field.Control>
                <field.Input type="text" autoComplete="name" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="email"
          validators={{
            onBlur: SignUpFormSchema._def.schema.shape.email,
          }}
        >
          {field => (
            <field.Item>
              <field.Label>Email address</field.Label>
              <field.Control>
                <field.Input type="email" autoComplete="email" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{
            onBlur: SignUpFormSchema._def.schema.shape.password,
          }}
        >
          {field => (
            <field.Item>
              <field.Label>Password</field.Label>
              <field.Control>
                <field.Input type="password" autoComplete="new-password" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onBlur: SignUpFormSchema._def.schema.shape.confirmPassword,
          }}
        >
          {field => (
            <field.Item>
              <field.Label>Confirm Password</field.Label>
              <field.Control>
                <field.Input type="password" autoComplete="new-password" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.SubmitButton className="w-full" loadingText="Signing up...">
          Sign Up
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
