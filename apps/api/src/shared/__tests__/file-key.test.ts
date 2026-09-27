import { describe, expect, test } from "bun:test"
import { FileKeySchema } from "#shared/file-key.ts"

describe("FileKeySchema", () => {
  test.each(["avatar.png", "user_123/avatar.png", "user-123/docs/report.v2.pdf", "..hidden/file"])(
    "accepts %s",
    (key) => {
      expect(FileKeySchema.safeParse(key).success).toBe(true)
    }
  )

  test.each([
    "",
    "/avatar.png",
    "user/",
    "user//avatar.png",
    "../avatar.png",
    "user/../avatar.png",
    "user/./avatar.png",
    "user/avatar image.png",
    "user\\avatar.png",
    "usér/avatar.png",
  ])("rejects %j", (key) => {
    expect(FileKeySchema.safeParse(key).success).toBe(false)
  })
})
