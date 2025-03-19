import { EmailSchema, PasswordSchema, matchPasswords } from "@init/auth/schema"
import * as z from "@init/utils/schema"

export const SignUpFormSchema = z
  .formData({
    confirmPassword: z.text(PasswordSchema),
    email: z.text(EmailSchema),
    name: z.text(z.string().min(1)),
    password: z.text(PasswordSchema),
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignUpFormData = z.infer<typeof SignUpFormSchema>

export const SignInWithPasswordFormSchema = z.formData({
  email: z.text(EmailSchema),
  password: z.text(PasswordSchema),
})
