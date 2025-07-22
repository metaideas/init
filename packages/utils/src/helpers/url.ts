import { isProduction } from "./environment"

const LEADING_SLASHES = /^\/+/
const MULTIPLE_SLASHES = /\/+/g

/**
 * Adds or overrides the protocol for a URL.
 *
 * Explicitly provided protocols will override existing ones.
 * Useful for security enforcement and environment normalization.
 */
export function addProtocol(url: string, protocol?: "http" | "https") {
  if (url.includes("://")) {
    const [existingProtocol, ...rest] = url.split("://")
    const urlWithoutProtocol = rest.join("://")

    if (!existingProtocol) {
      return url
    }

    if (!protocol) {
      return `${existingProtocol.toLowerCase()}://${urlWithoutProtocol}`
    }

    return `${protocol}://${urlWithoutProtocol}`
  }

  const defaultProtocol = isProduction ? "https" : "http"
  return `${protocol ?? defaultProtocol}://${url}`
}

export function createUrlBuilder(baseUrl: string, protocol?: "http" | "https") {
  const baseUrlObject = new URL(addProtocol(baseUrl, protocol))

  return function buildUrl<T extends string>(
    pathname: T,
    options?: {
      query?: Record<string, string | number | boolean | undefined>
    }
  ): string {
    const cleanedPathname = pathname.replace(LEADING_SLASHES, "")
    const fullPath =
      baseUrlObject.pathname === "/"
        ? `/${cleanedPathname}`
        : `${baseUrlObject.pathname}/${cleanedPathname}`

    const normalizedPath = fullPath.replace(MULTIPLE_SLASHES, "/")
    const url = new URL(normalizedPath, baseUrlObject.origin)

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value.toString())
        }
      }
    }

    return url.toString()
  }
}
