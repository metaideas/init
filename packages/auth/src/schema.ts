import * as z from "@init/utils/schema"

export const EmailSchema = z.email({
  error: issue =>
    issue.input === undefined ? "Email is required" : "Invalid email address",
})

export const PasswordSchema = z
  .string({ error: "Password is required" })
  .min(1, { error: "Password is required" })
  .min(8, { error: "Password must be more than 8 characters" })
  .max(32, { error: "Password must be less than 32 characters" })

export const matchPasswords = (data: {
  password: string
  confirmPassword: string
}) => data.password === data.confirmPassword
