"use client"
import { useStateAction } from "next-safe-action/stateful-hooks"
import Link from "next/link"

import { Button } from "@this/ui/button"
import { useAppForm } from "@this/ui/form"

import { mergeForm, useTransform } from "@tanstack/react-form"
import { signInWithPassword } from "~/features/auth/actions"
import { SignInWithPasswordFormSchema } from "~/features/auth/validation"

const FieldsSchema = SignInWithPasswordFormSchema._def.schema

export default function SignInWithPasswordForm() {
  const action = useStateAction(signInWithPassword, {
    initResult: { data: undefined },
  })

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: FieldsSchema },
    transform: useTransform(
      baseForm =>
        mergeForm(baseForm, {
          errorMap: {
            onServer: action.result.serverError,
          },
        }),
      [action.result]
    ),
  })

  return (
    <form
      action={action.execute}
      onSubmit={() => form.handleSubmit()}
      className="space-y-4"
    >
      <form.AppForm>
        <form.AppField
          name="email"
          validators={{ onBlur: FieldsSchema.shape.email }}
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
          validators={{ onBlur: FieldsSchema.shape.password }}
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
        <form.ServerError title="Form Error" />
        <form.SubmitButton className="w-full" loadingText="Signing in...">
          Sign in
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
