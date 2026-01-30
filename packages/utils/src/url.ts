import { cleanDoubleSlashes, joinURL, normalizeURL, withQuery, withTrailingSlash } from "ufo"

/**
 * Creates a URL builder function for a given base URL.
 *
 * The builder normalizes paths, cleans double slashes, and handles query parameters.
 *
 * @throws {Error} If the base URL is invalid
 * @throws {Error} If the base URL contains a dangerous or unsupported protocol
 * @throws {Error} If the base URL contains credentials
 */
export function createUrlBuilder(baseUrl: string, protocol: "http" | "https" = "https") {
  const trimmedBaseUrl = baseUrl.trim()
  const base = /^https?:\/\//i.test(trimmedBaseUrl)
    ? trimmedBaseUrl.replace(/^https?:\/\//i, `${protocol}://`)
    : `${protocol}://${trimmedBaseUrl}`

  return function buildUrl<T extends string>(
    pathname: T,
    options?: {
      query?: Record<string, string | number | boolean | undefined>
    }
  ): string {
    const joined = joinURL(base, pathname)
    const cleaned = cleanDoubleSlashes(joined)
    let normalized = normalizeURL(cleaned)

    if (pathname === "" || pathname === "/") {
      normalized = withTrailingSlash(normalized)
    }

    if (!options?.query) {
      return normalized
    }

    const filteredQuery = Object.fromEntries(
      Object.entries(options.query).filter(([, v]) => v !== undefined)
    ) as Record<string, string | number | boolean>

    return withQuery(normalized, filteredQuery)
  }
}
