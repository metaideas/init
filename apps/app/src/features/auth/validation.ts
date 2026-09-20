import * as z from "@init/utils/schema"

export const EmailSchema = z.email({
  error: (issue) => (issue.input === undefined ? "Email is required" : "Invalid email address"),
})

export const PasswordSchema = z
  .string({ error: "Password is required" })
  .min(1, { error: "Password is required" })
  .min(8, { error: "Password must be more than 8 characters" })
  .max(32, { error: "Password must be less than 32 characters" })

export const NameSchema = z.string().min(1, { error: "Name is required" })

export const SignUpFormSchema = z.object({
  confirmPassword: PasswordSchema,
  email: EmailSchema,
  name: NameSchema,
  password: PasswordSchema,
})

export const SignInWithPasswordFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})
export const ForgotPasswordFormSchema = z.object({
  email: EmailSchema,
})

export const ResetPasswordFormSchema = z
  .object({
    confirmPassword: PasswordSchema,
    password: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  })
