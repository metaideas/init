import { describe, expect, test } from "bun:test"

import { getOptionBeforeCommand, getUnknownOption } from "../utils"

describe("getUnknownOption", () => {
  const args = {
    "keep-apps": { type: "string" as const },
    yes: { type: "boolean" as const },
  }

  test("accepts declared kebab-case and camel-case options", () => {
    expect(getUnknownOption(["--keep-apps", "app", "--yes"], args)).toBeUndefined()
    expect(getUnknownOption(["--keepApps=app", "--no-yes"], args)).toBeUndefined()
  })

  test("returns an unknown option", () => {
    expect(getUnknownOption(["--keepApp", "app"], args)).toBe("keepApp")
  })
})

describe("getOptionBeforeCommand", () => {
  const commandNames = new Set(["add", "rename", "setup"])

  test("returns an option before a leaf command", () => {
    expect(getOptionBeforeCommand(["template", "--yes", "setup"], commandNames)).toBe("yes")
    expect(getOptionBeforeCommand(["--bogus", "template", "rename"], commandNames)).toBe("bogus")
  })

  test("accepts options after a leaf command and built-in help", () => {
    expect(getOptionBeforeCommand(["template", "setup", "--yes"], commandNames)).toBeNull()
    expect(getOptionBeforeCommand(["template", "--help"], commandNames)).toBeNull()
  })
})
