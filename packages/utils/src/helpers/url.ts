const LEADING_SLASHES = /^\/+/
const MULTIPLE_SLASHES = /\/+/g

export function createUrlBuilder(
  url: string,
  protocol: "http" | "https" = "https"
) {
  // Split the URL into domain and base path
  const [domain, ...pathParts] = url.split("/")
  const basePath = pathParts.length > 0 ? `/${pathParts.join("/")}` : ""
  const baseUrl = `${protocol}://${domain}`

  return function buildUrl<T extends string>(
    pathname: T,
    options?: {
      query?: Record<string, string | number | boolean | undefined>
      decoded?: boolean
    }
  ): string {
    // Ensure pathname starts with a single slash and combine with base path
    const cleanPathname = pathname.replace(LEADING_SLASHES, "")
    const fullPath = `${basePath}/${cleanPathname}`.replace(
      MULTIPLE_SLASHES,
      "/"
    )
    const builtUrl = new URL(fullPath, baseUrl)

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          builtUrl.searchParams.set(key, value.toString())
        }
      }
    }

    const urlString = builtUrl.toString()

    if (options?.decoded) {
      return decodeURIComponent(urlString)
    }

    return urlString
  }
}
