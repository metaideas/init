import { describe, expect, test } from "bun:test"
import { FieldErrorsSchema, FormErrorStateSchema } from "#features/auth/forms.ts"
import { SignInWithPasswordFormSchema } from "#features/auth/validation.ts"

describe("FieldErrorsSchema", () => {
  test("keeps only the message of each issue", async () => {
    const password = "Sup3rSecretPw"
    const result = await SignInWithPasswordFormSchema["~standard"].validate({
      email: "user",
      password: password.slice(0, 5),
    })
    const issues =
      result.issues?.map((issue) => ({ input: password, message: issue.message, path: issue.path }))
      ?? []
    const fieldErrors = FieldErrorsSchema.parse({
      email: issues.filter((issue) => issue.path?.[0] === "email"),
      password: issues.filter((issue) => issue.path?.[0] === "password"),
    })

    expect(fieldErrors).toEqual({
      email: [{ message: "Invalid email address" }],
      password: [{ message: "Password must be more than 8 characters" }],
    })
    expect(JSON.stringify(fieldErrors)).not.toContain(password)
  })
})

describe("FormErrorStateSchema", () => {
  test("drops submitted values from the form state", () => {
    const state = FormErrorStateSchema.parse({
      errorMap: { onServer: { fields: {}, form: "Invalid email or password" } },
      values: { email: "user@example.com", password: "Sup3rSecretPw" },
    })

    expect(state).toEqual({
      errorMap: { onServer: { fields: {}, form: "Invalid email or password" } },
    })
  })

  test("rejects a malformed state", () => {
    expect(FormErrorStateSchema.safeParse({ errorMap: { onServer: "error" } }).success).toBe(false)
  })
})
