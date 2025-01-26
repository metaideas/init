import * as z from "#index.ts"

export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(1, "Password is required")
  .min(8, "Password must be more than 8 characters")
  .max(32, "Password must be less than 32 characters")

export const matchPasswords = (data: {
  password: string
  confirmPassword: string
}) => data.password === data.confirmPassword
