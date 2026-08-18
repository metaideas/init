import { describe, expect, test } from "bun:test"

import { getOptionValues } from "../setup"

describe("getOptionValues", () => {
  test("reads kebab-case and camel-case options", () => {
    expect(getOptionValues(["--keep-apps", "app,web"], "keep-apps")).toEqual(["app", "web"])
    expect(getOptionValues(["--keepApps", "app,web"], "keep-apps")).toEqual(["app", "web"])
  })

  test("accumulates repeated and inline options", () => {
    expect(
      getOptionValues(
        ["--keep-apps=app", "--keepApps", "web,docs", "--keep-apps=desktop"],
        "keep-apps"
      )
    ).toEqual(["app", "web", "docs", "desktop"])
  })
})
