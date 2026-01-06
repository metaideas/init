import { describe, expect, test } from "bun:test"
import { addProtocol, createUrlBuilder } from "../url"

const HTTP_OR_HTTPS_PROTOCOL_REGEX = /^https?:\/\/example\.com$/

/**
 * Compare two URLs for equality, ignoring query parameter order.
 * Query parameters are parsed and compared as sets of key-value pairs.
 */
function expectUrlEqual(actual: string, expected: string) {
  const actualUrl = new URL(actual)
  const expectedUrl = new URL(expected)

  // Compare everything except search params
  expect(actualUrl.origin).toBe(expectedUrl.origin)
  expect(actualUrl.pathname).toBe(expectedUrl.pathname)
  expect(actualUrl.hash).toBe(expectedUrl.hash)

  // Compare query params regardless of order
  const actualParams = Object.fromEntries(actualUrl.searchParams.entries())
  const expectedParams = Object.fromEntries(expectedUrl.searchParams.entries())
  expect(actualParams).toEqual(expectedParams)
}

describe("addProtocol", () => {
  test("uses default protocol based on environment", () => {
    const result = addProtocol("example.com")
    expect(result).toMatch(HTTP_OR_HTTPS_PROTOCOL_REGEX)
  })

  test("adds specified protocol", () => {
    expect(addProtocol("example.com", "https")).toBe("https://example.com")
    expect(addProtocol("example.com", "http")).toBe("http://example.com")
  })

  test("handles urls with paths and ports", () => {
    expect(addProtocol("example.com/path/to/resource", "https")).toBe(
      "https://example.com/path/to/resource"
    )
    expect(addProtocol("example.com:3000", "http")).toBe("http://example.com:3000")
    expect(addProtocol("api.example.com", "https")).toBe("https://api.example.com")
  })

  test("preserves existing protocol when none specified", () => {
    expect(addProtocol("https://example.com")).toBe("https://example.com")
    expect(addProtocol("http://example.com")).toBe("http://example.com")
  })

  test("overrides existing protocol when specified", () => {
    expect(addProtocol("http://example.com", "https")).toBe("https://example.com")
    expect(addProtocol("https://example.com/api/v1", "https")).toBe("https://example.com/api/v1")
    expect(addProtocol("HTTP://example.com", "https")).toBe("https://example.com")
  })

  test("handles complex URLs with existing protocols", () => {
    expect(addProtocol("http://localhost:3000/api", "http")).toBe("http://localhost:3000/api")
    expect(addProtocol("https://example.com/api/v1", "https")).toBe("https://example.com/api/v1")
  })

  test("enables security enforcement", () => {
    const userProvidedUrl = "http://malicious-site.com"
    const secureUrl = addProtocol(userProvidedUrl, "https")
    expect(secureUrl).toBe("https://malicious-site.com")
  })

  test("enables environment-based normalization", () => {
    const mixedUrls = ["http://api.example.com", "https://api.example.com", "api.example.com"]

    const devUrls = mixedUrls.map((url) => addProtocol(url, "http"))
    expect(devUrls).toEqual([
      "http://api.example.com",
      "http://api.example.com",
      "http://api.example.com",
    ])

    const prodUrls = mixedUrls.map((url) => addProtocol(url, "https"))
    expect(prodUrls).toEqual([
      "https://api.example.com",
      "https://api.example.com",
      "https://api.example.com",
    ])
  })
})

describe("createUrlBuilder", () => {
  test("uses environment-based default protocol", () => {
    const buildUrl = createUrlBuilder("example.com")
    const result = buildUrl("/test")
    expect(result).toBe("http://example.com/test")
  })

  test("uses specified protocol", () => {
    const buildUrl = createUrlBuilder("example.com", "http")
    const result = buildUrl("/test")
    expect(result).toBe("http://example.com/test")
  })

  test("handles base paths", () => {
    const buildUrl = createUrlBuilder("example.com/api/v1")
    expect(buildUrl("/users")).toBe("http://example.com/api/v1/users")

    const buildUrl2 = createUrlBuilder("example.com/api/v1/resources")
    expect(buildUrl2("/items")).toBe("http://example.com/api/v1/resources/items")
  })

  test("normalizes pathnames", () => {
    const buildUrl = createUrlBuilder("example.com")
    expect(buildUrl("/test")).toBe("http://example.com/test")
    expect(buildUrl("test")).toBe("http://example.com/test")
    expect(buildUrl("///test")).toBe("http://example.com/test")
    expect(buildUrl("/api/v1/users/123")).toBe("http://example.com/api/v1/users/123")
    expect(buildUrl("/test/")).toBe("http://example.com/test/")
  })

  test("handles query parameters", () => {
    const buildUrl = createUrlBuilder("example.com")

    expectUrlEqual(
      buildUrl("/test", { query: { limit: 10, page: 1 } }),
      "http://example.com/test?page=1&limit=10"
    )

    expectUrlEqual(
      buildUrl("/test", {
        query: { active: true, count: 0, page: 1, search: "hello world" },
      }),
      "http://example.com/test?page=1&active=true&search=hello+world&count=0"
    )

    expectUrlEqual(
      buildUrl("/test", {
        query: { filter: undefined, page: 1, search: "test" },
      }),
      "http://example.com/test?page=1&search=test"
    )
  })

  test("handles URL encoding", () => {
    const buildUrl = createUrlBuilder("example.com")

    expectUrlEqual(
      buildUrl("/test", { query: { search: "hello world" } }),
      "http://example.com/test?search=hello+world"
    )

    expectUrlEqual(
      buildUrl("/search", {
        query: { filter: "type:email", q: "test@example.com" },
      }),
      "http://example.com/search?q=test%40example.com&filter=type%3Aemail"
    )
  })

  test("handles complex scenarios", () => {
    const buildUrl = createUrlBuilder("api.example.com/v2/resources")
    expectUrlEqual(
      buildUrl("/users/123/posts", { query: { include: "comments" } }),
      "http://api.example.com/v2/resources/users/123/posts?include=comments"
    )

    const buildUrl2 = createUrlBuilder("localhost:3000/api", "http")
    expect(buildUrl2("/health")).toBe("http://localhost:3000/api/health")

    const buildUrl3 = createUrlBuilder("example.com/api//v1")
    expect(buildUrl3("//users//123")).toBe("http://example.com/api/v1/users/123")
  })

  test("handles edge cases", () => {
    const buildUrl = createUrlBuilder("example.com")
    expect(buildUrl("")).toBe("http://example.com/")
    expect(buildUrl("/")).toBe("http://example.com/")

    expectUrlEqual(
      buildUrl("/test", { query: { active: false, verified: true } }),
      "http://example.com/test?active=false&verified=true"
    )
  })

  test("preserves existing protocols", () => {
    const buildUrl1 = createUrlBuilder("https://example.com")
    expect(buildUrl1("/test")).toBe("https://example.com/test")

    const buildUrl2 = createUrlBuilder("http://example.com")
    expect(buildUrl2("/test")).toBe("http://example.com/test")
  })

  test("overrides existing protocols when specified", () => {
    const buildUrl = createUrlBuilder("http://example.com", "https")
    expect(buildUrl("/test")).toBe("https://example.com/test")

    const buildUrl2 = createUrlBuilder("https://example.com/api/v1")
    expect(buildUrl2("/users")).toBe("https://example.com/api/v1/users")

    const buildUrl3 = createUrlBuilder("http://localhost:3000/api")
    expect(buildUrl3("/health")).toBe("http://localhost:3000/api/health")

    const buildUrl4 = createUrlBuilder("HTTP://example.com", "https")
    expect(buildUrl4("/test")).toBe("https://example.com/test")
  })
})
