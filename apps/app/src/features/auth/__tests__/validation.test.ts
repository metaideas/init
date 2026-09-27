import { describe, expect, test } from "bun:test"
import {
  EmailSchema,
  ForgotPasswordFormSchema,
  NameSchema,
  PasswordSchema,
  ResetPasswordFormSchema,
  SignInWithPasswordFormSchema,
  SignUpFormSchema,
} from "#features/auth/validation.ts"

type Issue = { message: string; path?: ReadonlyArray<PropertyKey | { key: PropertyKey }> }

async function getIssues(
  schema: { "~standard": { validate: (value: unknown) => unknown } },
  value?: unknown
) {
  const result = (await schema["~standard"].validate(value)) as { issues?: Issue[] }

  return (result.issues ?? []).map((issue) => ({
    message: issue.message,
    path: (issue.path ?? []).map((segment) =>
      typeof segment === "object" ? segment.key : segment
    ),
  }))
}

describe("EmailSchema", () => {
  test("accepts a valid email address", () => {
    expect(EmailSchema.parse("user@example.com")).toBe("user@example.com")
  })

  test("requires an email address", async () => {
    expect(await getIssues(EmailSchema)).toEqual([{ message: "Email is required", path: [] }])
  })

  test("rejects an invalid email address", async () => {
    expect(await getIssues(EmailSchema, "user")).toEqual([
      { message: "Invalid email address", path: [] },
    ])
  })
})

describe("PasswordSchema", () => {
  test("accepts a password between 8 and 32 characters", () => {
    expect(PasswordSchema.parse("password")).toBe("password")
  })

  test("requires a password", async () => {
    expect(await getIssues(PasswordSchema)).toEqual([{ message: "Password is required", path: [] }])
  })

  test("reports every failed length check for an empty password", async () => {
    expect(await getIssues(PasswordSchema, "")).toEqual([
      { message: "Password is required", path: [] },
      { message: "Password must be more than 8 characters", path: [] },
    ])
  })

  test("rejects a short password", async () => {
    expect(await getIssues(PasswordSchema, "short")).toEqual([
      { message: "Password must be more than 8 characters", path: [] },
    ])
  })

  test("rejects a long password", async () => {
    expect(await getIssues(PasswordSchema, "a".repeat(33))).toEqual([
      { message: "Password must be less than 32 characters", path: [] },
    ])
  })
})

describe("NameSchema", () => {
  test("requires a name", async () => {
    expect(await getIssues(NameSchema, "")).toEqual([{ message: "Name is required", path: [] }])
  })
})

describe("SignInWithPasswordFormSchema", () => {
  test("parses valid credentials", () => {
    const value = { email: "user@example.com", password: "password" }

    expect(SignInWithPasswordFormSchema.parse(value)).toEqual(value)
  })

  test("reports field paths", async () => {
    expect(
      await getIssues(SignInWithPasswordFormSchema, { email: "user", password: "short" })
    ).toEqual([
      { message: "Invalid email address", path: ["email"] },
      { message: "Password must be more than 8 characters", path: ["password"] },
    ])
  })
})

describe("SignUpFormSchema", () => {
  test("parses a valid sign-up", () => {
    const value = {
      confirmPassword: "password",
      email: "user@example.com",
      name: "User",
      password: "password",
    }

    expect(SignUpFormSchema.parse(value)).toEqual(value)
  })

  test("reports missing fields", async () => {
    expect(await getIssues(SignUpFormSchema, {})).toEqual([
      { message: "Password is required", path: ["confirmPassword"] },
      { message: "Email is required", path: ["email"] },
      { message: "Name is required", path: ["name"] },
      { message: "Password is required", path: ["password"] },
    ])
  })
})

describe("ForgotPasswordFormSchema", () => {
  test("requires an email address", async () => {
    expect(await getIssues(ForgotPasswordFormSchema, {})).toEqual([
      { message: "Email is required", path: ["email"] },
    ])
  })
})

describe("ResetPasswordFormSchema", () => {
  test("parses matching passwords", () => {
    const value = { confirmPassword: "password", password: "password" }

    expect(ResetPasswordFormSchema.parse(value)).toEqual(value)
  })

  test("reports mismatched passwords on confirmPassword", async () => {
    expect(
      await getIssues(ResetPasswordFormSchema, {
        confirmPassword: "password2",
        password: "password",
      })
    ).toEqual([{ message: "Passwords don't match", path: ["confirmPassword"] }])
  })

  test("runs the match check after a length check fails", async () => {
    expect(
      await getIssues(ResetPasswordFormSchema, { confirmPassword: "short", password: "password" })
    ).toEqual([
      { message: "Password must be more than 8 characters", path: ["confirmPassword"] },
      { message: "Passwords don't match", path: ["confirmPassword"] },
    ])
  })
})
