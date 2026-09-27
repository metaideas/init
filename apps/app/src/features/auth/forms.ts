import * as z from "@init/utils/schema/mini"
import { formOptions } from "@tanstack/react-form-start"
import { SignInWithPasswordFormSchema } from "#features/auth/validation.ts"

export const signInWithPasswordFormOptions = formOptions({
  defaultValues: { email: "", password: "" },
  validators: { onSubmit: SignInWithPasswordFormSchema },
})

/**
 * Validation issues by field name. Parsing keeps only each issue's message, so submitted values
 * never leave the server.
 */
export const FieldErrorsSchema = z.record(z.string(), z.array(z.object({ message: z.string() })))

/**
 * Server validation and authentication errors for a native form submission.
 */
export const FormErrorStateSchema = z.object({
  errorMap: z.object({
    onServer: z.object({
      fields: FieldErrorsSchema,
      form: z.optional(z.string()),
    }),
  }),
})

export type FormErrorState = z.infer<typeof FormErrorStateSchema>
