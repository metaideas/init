export function createUrlBuilder(
  url: string,
  protocol: "http" | "https" = "https"
) {
  const baseUrl = `${protocol}://${url}`

  return function buildUrl<T extends string>(
    pathname: T,
    options?: {
      query?: Record<string, string | number>
      decoded?: boolean
    }
  ): string {
    const builtUrl = new URL(pathname, baseUrl)

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        builtUrl.searchParams.set(key, value.toString())
      }
    }

    const urlString = builtUrl.toString()

    if (options?.decoded) {
      return decodeURIComponent(urlString)
    }

    return urlString
  }
}
