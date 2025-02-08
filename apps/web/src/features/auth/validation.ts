import { PasswordSchema, matchPasswords } from "@this/auth/schema"
import * as z from "@this/utils/schema"

export const SignUpSchema = z
  .object({
    confirmPassword: PasswordSchema,
    email: z.string().email(),
    name: z.string().min(1),
    password: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
export type SignUpData = z.infer<typeof SignUpSchema>

export const SignInWithPasswordSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
})
export type SignInWithPasswordData = z.infer<typeof SignInWithPasswordSchema>
