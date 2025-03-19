"use client"

import { mergeForm, useTransform } from "@tanstack/react-form"
import { useAction } from "next-safe-action/hooks"
import { useStateAction } from "next-safe-action/stateful-hooks"

import { useAppForm } from "@init/ui/form"

import { checkEmailAvailability, signUp } from "~/features/auth/actions"
import { SignUpFormSchema } from "~/features/auth/validation"

const FieldsSchema = SignUpFormSchema._def.schema._def.schema

export default function SignUpForm() {
  const action = useStateAction(signUp, {
    initResult: { data: undefined },
  })
  const checkEmailAvailabilityAction = useAction(checkEmailAvailability)

  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
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
      onSubmit: FieldsSchema,
    },
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
          name="name"
          validators={{ onBlur: FieldsSchema.shape.name }}
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
            onBlur: FieldsSchema.shape.email,
            onBlurAsync: async ({ value }) => {
              const result = await checkEmailAvailabilityAction.executeAsync({
                email: value,
              })

              if (result?.data?.available) {
                return null
              }

              return { message: "Email is already in use" }
            },
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
          validators={{ onBlur: FieldsSchema.shape.password }}
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
          validators={{ onBlur: FieldsSchema.shape.confirmPassword }}
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
        <form.ServerError />
        <form.SubmitButton className="w-full" loadingText="Signing up...">
          Sign Up
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
