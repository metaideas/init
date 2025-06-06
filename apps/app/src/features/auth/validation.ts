import { EmailSchema, PasswordSchema, matchPasswords } from "@init/auth/schema"
import * as z from "@init/utils/schema"

// Used in the form component
export const SignUpFormSchema = z.object({
  name: z.string().min(1),
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: PasswordSchema,
})
export type SignUpForm = z.infer<typeof SignUpFormSchema>
// Used in the form action
export const SignUpFormDataSchema = z.form
  .formData({
    confirmPassword: z.form.text(PasswordSchema),
    email: z.form.text(EmailSchema),
    name: z.form.text(z.string().min(1)),
    password: z.form.text(PasswordSchema),
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignUpFormData = z.infer<typeof SignUpFormSchema>

// Used in the form component
export const SignInWithPasswordFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})
export type SignInWithPasswordForm = z.infer<
  typeof SignInWithPasswordFormSchema
>
// Used in the form action
export const SignInWithPasswordFormDataSchema = z.form.formData({
  email: z.form.text(SignInWithPasswordFormSchema.shape.email),
  password: z.form.text(SignInWithPasswordFormSchema.shape.password),
})
export type SignInWithPasswordFormData = z.infer<
  typeof SignInWithPasswordFormDataSchema
>
