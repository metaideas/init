"use client"

import { mergeForm, useTransform } from "@tanstack/react-form"
import Link from "next/link"
import { useActionState } from "react"

import { Button } from "@init/ui/components/button"
import { useAppForm } from "@init/ui/components/form"

import { signInWithPassword } from "~/features/auth/actions"
import { SignInWithPasswordFormSchema as schema } from "~/features/auth/validation"

export default function SignInWithPasswordForm() {
  const [state, action] = useActionState(signInWithPassword, {})

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
    transform: useTransform(
      (baseForm) =>
        mergeForm(baseForm, {
          errorMap: {
            onServer: state.serverError,
          },
        }),
      [state]
    ),
  })

  return (
    <form
      action={action}
      onSubmit={() => form.handleSubmit()}
      className="space-y-4"
    >
      <form.AppForm>
        <form.AppField name="email" validators={{ onBlur: schema.shape.email }}>
          {(field) => (
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
          validators={{ onBlur: schema.shape.password }}
        >
          {(field) => (
            <field.Item>
              <field.Label>Password</field.Label>
              <field.Control>
                <field.Input type="password" autoComplete="current-password" />
              </field.Control>
              <field.Message />
              <Button variant="link" asChild className="p-0">
                <Link href="/sign-in/reset-password">Forgot password?</Link>
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
