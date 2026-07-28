import { describe, expect, test } from "bun:test"
import { getProjectNameValidationError } from "#lib/shared/project.ts"

describe("getProjectNameValidationError", () => {
  test("accepts npm-scope-safe project names", () => {
    expect(getProjectNameValidationError("my-app_2")).toBeUndefined()
  })

  test.each(["", "MyApp", "my app", "-my-app"])("rejects %j", (name) => {
    expect(getProjectNameValidationError(name)).toBeString()
  })
})
