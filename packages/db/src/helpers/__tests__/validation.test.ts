import type * as z from "@init/utils/schema"
import { describe, expect, expectTypeOf, test } from "bun:test"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "#helpers/validation.ts"
import { type User, users } from "#schema.ts"

const user: unknown = {
  banExpiresAt: null,
  banReason: null,
  banned: false,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  email: "user@example.com",
  emailVerified: true,
  id: "user_123",
  image: null,
  metadata: { plan: "pro" },
  name: "User",
  role: "admin",
  updatedAt: new Date("2026-01-02T00:00:00Z"),
}

describe("createSelectSchema", () => {
  const UserSchema = createSelectSchema(users)

  test("parses a selected row", () => {
    const parsed: unknown = UserSchema.parse(user)

    expect(parsed).toEqual(user)
  })

  test("rejects values outside a column enum", () => {
    expect(UserSchema.safeParse({ email: "user@example.com", role: "owner" }).success).toBe(false)
  })

  test("infers column types from the table", () => {
    type SelectedUser = z.infer<typeof UserSchema>

    expectTypeOf<SelectedUser["email"]>().toEqualTypeOf<User["email"]>()
    expectTypeOf<SelectedUser["banReason"]>().toEqualTypeOf<User["banReason"]>()
    expectTypeOf<SelectedUser["banExpiresAt"]>().toEqualTypeOf<User["banExpiresAt"]>()
    expectTypeOf<SelectedUser["role"]>().toEqualTypeOf<User["role"]>()
  })
})

describe("createInsertSchema", () => {
  const NewUserSchema = createInsertSchema(users)

  test("accepts a row with only the required columns", () => {
    const newUser = { email: "user@example.com", name: "User" }

    expect(NewUserSchema.parse(newUser)).toEqual(newUser)
  })

  test("requires columns without defaults", () => {
    expect(NewUserSchema.safeParse({ email: "user@example.com" }).success).toBe(false)
  })

  test("makes columns with defaults optional", () => {
    type NewUser = z.infer<typeof NewUserSchema>

    expectTypeOf<Pick<NewUser, "email" | "name">>().toEqualTypeOf<{ email: string; name: string }>()
    expectTypeOf<Pick<NewUser, "banned">>().toEqualTypeOf<{ banned?: boolean | undefined }>()
  })
})

describe("createUpdateSchema", () => {
  const UserUpdateSchema = createUpdateSchema(users)

  test("accepts a partial row", () => {
    expect(UserUpdateSchema.parse({ name: "Renamed" })).toEqual({ name: "Renamed" })
  })

  test("still validates the provided columns", () => {
    expect(UserUpdateSchema.safeParse({ banned: "yes" }).success).toBe(false)
  })

  test("makes every column optional", () => {
    type UserUpdate = z.infer<typeof UserUpdateSchema>

    expectTypeOf<Pick<UserUpdate, "email">>().toEqualTypeOf<{ email?: string | undefined }>()
  })
})
