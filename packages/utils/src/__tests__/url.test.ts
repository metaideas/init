import { describe, expect, test } from "bun:test"
import { createUrlBuilder } from "#url.ts"

/**
 * Compare two URLs for equality, ignoring query parameter order.
 * Query parameters are parsed and compared as sets of key-value pairs.
 */
function expectUrlEqual(actual: string, expected: string) {
  const actualUrl = new URL(actual)
  const expectedUrl = new URL(expected)

  expect(actualUrl.origin).toBe(expectedUrl.origin)
  expect(actualUrl.pathname).toBe(expectedUrl.pathname)
  expect(actualUrl.hash).toBe(expectedUrl.hash)

  const actualParams = Object.fromEntries(actualUrl.searchParams.entries())
  const expectedParams = Object.fromEntries(expectedUrl.searchParams.entries())
  expect(actualParams).toEqual(expectedParams)
}

describe("createUrlBuilder", () => {
  test("defaults to https protocol", () => {
    const buildUrl = createUrlBuilder("example.com")
    const result = buildUrl("/test")
    expect(result).toBe("https://example.com/test")
  })

  test("uses specified protocol", () => {
    const buildUrl = createUrlBuilder("example.com", "http")
    const result = buildUrl("/test")
    expect(result).toBe("http://example.com/test")
  })

  test("handles base paths", () => {
    const buildUrl = createUrlBuilder("example.com/api/v1")
    expect(buildUrl("/users")).toBe("https://example.com/api/v1/users")

    const buildUrl2 = createUrlBuilder("example.com/api/v1/resources")
    expect(buildUrl2("/items")).toBe("https://example.com/api/v1/resources/items")
  })

  test("normalizes pathnames", () => {
    const buildUrl = createUrlBuilder("example.com")
    expect(buildUrl("/test")).toBe("https://example.com/test")
    expect(buildUrl("test")).toBe("https://example.com/test")
    expect(buildUrl("///test")).toBe("https://example.com/test")
    expect(buildUrl("/api/v1/users/123")).toBe("https://example.com/api/v1/users/123")
    expect(buildUrl("/test/")).toBe("https://example.com/test/")
  })

  test("handles query parameters", () => {
    const buildUrl = createUrlBuilder("example.com")

    expectUrlEqual(
      buildUrl("/test", { query: { limit: 10, page: 1 } }),
      "https://example.com/test?page=1&limit=10"
    )

    expectUrlEqual(
      buildUrl("/test", {
        query: { active: true, count: 0, page: 1, search: "hello world" },
      }),
      "https://example.com/test?page=1&active=true&search=hello+world&count=0"
    )

    expectUrlEqual(
      buildUrl("/test", {
        query: { filter: undefined, page: 1, search: "test" },
      }),
      "https://example.com/test?page=1&search=test"
    )
  })

  test("handles URL encoding", () => {
    const buildUrl = createUrlBuilder("example.com")

    expectUrlEqual(
      buildUrl("/test", { query: { search: "hello world" } }),
      "https://example.com/test?search=hello+world"
    )

    expectUrlEqual(
      buildUrl("/search", {
        query: { filter: "type:email", q: "test@example.com" },
      }),
      "https://example.com/search?q=test%40example.com&filter=type%3Aemail"
    )
  })

  test("handles complex scenarios", () => {
    const buildUrl = createUrlBuilder("api.example.com/v2/resources")
    expectUrlEqual(
      buildUrl("/users/123/posts", { query: { include: "comments" } }),
      "https://api.example.com/v2/resources/users/123/posts?include=comments"
    )

    const buildUrl2 = createUrlBuilder("localhost:3000/api", "http")
    expect(buildUrl2("/health")).toBe("http://localhost:3000/api/health")

    const buildUrl3 = createUrlBuilder("example.com/api//v1")
    expect(buildUrl3("//users//123")).toBe("https://example.com/api/v1/users/123")
  })

  test("handles edge cases", () => {
    const buildUrl = createUrlBuilder("example.com")
    expect(buildUrl("")).toBe("https://example.com/")
    expect(buildUrl("/")).toBe("https://example.com/")

    expectUrlEqual(
      buildUrl("/test", { query: { active: false, verified: true } }),
      "https://example.com/test?active=false&verified=true"
    )
  })

  test("applies default protocol to URLs with existing protocols", () => {
    const buildUrl1 = createUrlBuilder("https://example.com")
    expect(buildUrl1("/test")).toBe("https://example.com/test")

    const buildUrl2 = createUrlBuilder("http://example.com")
    expect(buildUrl2("/test")).toBe("https://example.com/test")

    const buildUrl3 = createUrlBuilder("HTTP://example.com")
    expect(buildUrl3("/test")).toBe("https://example.com/test")
  })

  test("overrides existing protocols when specified", () => {
    const buildUrl = createUrlBuilder("https://example.com", "http")
    expect(buildUrl("/test")).toBe("http://example.com/test")

    const buildUrl2 = createUrlBuilder("http://example.com/api/v1", "https")
    expect(buildUrl2("/users")).toBe("https://example.com/api/v1/users")

    const buildUrl3 = createUrlBuilder("https://localhost:3000/api", "http")
    expect(buildUrl3("/health")).toBe("http://localhost:3000/api/health")
  })
})
