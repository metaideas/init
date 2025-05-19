import { EmailSchema, PasswordSchema, matchPasswords } from "@init/auth/schema"
import * as z from "@init/utils/schema"

export const SignUpFormSchema = z.form
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

export const SignInWithPasswordFormSchema = z.form.formData({
  email: z.form.text(EmailSchema),
  password: z.form.text(PasswordSchema),
})

export type SignInWithPasswordFormData = z.infer<
  typeof SignInWithPasswordFormSchema
>
