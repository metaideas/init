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
  const commandNames = new Set(["setup"])

  test("returns an option before a leaf command", () => {
    expect(getOptionBeforeCommand(["template", "--yes", "setup"], "template", commandNames)).toBe(
      "yes"
    )
  })

  test("accepts options after a leaf command and built-in help", () => {
    expect(
      getOptionBeforeCommand(["template", "setup", "--yes"], "template", commandNames)
    ).toBeNull()
    expect(getOptionBeforeCommand(["template", "--help"], "template", commandNames)).toBeNull()
  })

  test("leaves unknown and root commands to citty", () => {
    expect(
      getOptionBeforeCommand(["template", "nope", "--flag"], "template", commandNames)
    ).toBeNull()
    expect(getOptionBeforeCommand(["nope", "--flag"], "template", commandNames)).toBeNull()
  })
})
