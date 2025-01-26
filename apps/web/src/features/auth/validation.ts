import { z } from "@this/validation"
import { PasswordSchema, matchPasswords } from "@this/validation/password"

export const SignUpSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
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
