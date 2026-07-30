import { describe, expect, test } from "bun:test"
import { checkIsSupportedFilesClientApp } from "../files-client"

describe("checkIsSupportedFilesClientApp", () => {
  test("supports the React and Astro apps", () => {
    expect(checkIsSupportedFilesClientApp("app")).toBeTrue()
    expect(checkIsSupportedFilesClientApp("web")).toBeTrue()
  })

  test("rejects clients without supported authentication transport", () => {
    expect(checkIsSupportedFilesClientApp("desktop")).toBeFalse()
    expect(checkIsSupportedFilesClientApp("mobile")).toBeFalse()
  })
})
