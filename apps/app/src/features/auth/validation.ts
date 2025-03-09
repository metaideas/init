import { EmailSchema, PasswordSchema, matchPasswords } from "@this/auth/schema"
import * as z from "@this/utils/schema"

export const SignUpFormSchema = z
  .object({
    confirmPassword: PasswordSchema,
    email: EmailSchema,
    name: z.string().min(1),
    password: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
export type SignUpFormData = z.infer<typeof SignUpFormSchema>

export const SignInWithPasswordFormSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
})
export type SignInWithPasswordFormData = z.infer<
  typeof SignInWithPasswordFormSchema
>
