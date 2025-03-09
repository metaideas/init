"use client"

import { useAction } from "next-safe-action/hooks"
import Link from "next/link"

import { Button } from "@this/ui/button"
import { useAppForm } from "@this/ui/form"
import { toast } from "@this/ui/sonner"

import { signInWithPassword } from "~/features/auth/actions"
import { SignInWithPasswordFormSchema } from "~/features/auth/validation"

export default function SignInWithPasswordForm() {
  const action = useAction(signInWithPassword)
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: SignInWithPasswordFormSchema,
    },
    onSubmit: async ({ value: { email, password } }) => {
      const result = await action.executeAsync({ email, password })

      result?.validationErrors?._errors?.map(error => {
        toast.error(error)
      })
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
          name="email"
          validators={{
            onBlur: SignInWithPasswordFormSchema.shape.email,
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
            onBlur: SignInWithPasswordFormSchema.shape.password,
          }}
        >
          {field => (
            <field.Item>
              <field.Label>Password</field.Label>
              <field.Control>
                <field.Input type="password" />
              </field.Control>
              <field.Message />
              <Button variant="link" asChild className="p-0">
                <Link href="/sign-in/reset-password">Forgot password?</Link>
              </Button>
            </field.Item>
          )}
        </form.AppField>
        <form.SubmitButton className="w-full" loadingText="Signing in...">
          Sign in
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
