import { describe, expect, test } from "bun:test"
import { checkIsSupportedFilesClientApp } from "../files-client"

describe("checkIsSupportedFilesClientApp", () => {
  test("supports the authenticated React app", () => {
    expect(checkIsSupportedFilesClientApp("app")).toBeTrue()
  })

  test("rejects clients without supported authentication transport", () => {
    expect(checkIsSupportedFilesClientApp("desktop")).toBeFalse()
    expect(checkIsSupportedFilesClientApp("mobile")).toBeFalse()
  })
})
