import * as z from "@init/utils/schema"

export const EmailSchema = z.email({
  error: (issue) => (issue.input === undefined ? "Email is required" : "Invalid email address"),
})

export const PasswordSchema = z
  .string({ error: "Password is required" })
  .min(1, { error: "Password is required" })
  .min(8, { error: "Password must be more than 8 characters" })
  .max(32, { error: "Password must be less than 32 characters" })

// Used in the form component
export const SignUpFormSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
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
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignUpFormData = z.infer<typeof SignUpFormDataSchema>

// Used in the form component
export const SignInWithPasswordFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})
export type SignInWithPasswordForm = z.infer<typeof SignInWithPasswordFormSchema>
// Used in the form action
export const SignInWithPasswordFormDataSchema = z.form.formData({
  email: z.form.text(SignInWithPasswordFormSchema.shape.email),
  password: z.form.text(SignInWithPasswordFormSchema.shape.password),
})
export type SignInWithPasswordFormData = z.infer<typeof SignInWithPasswordFormDataSchema>

// Used in the form component
export const ForgotPasswordFormSchema = z.object({
  email: EmailSchema,
})
export type ForgotPasswordForm = z.infer<typeof ForgotPasswordFormSchema>
