import { ip } from "./schema"

export interface Geolocation {
  /** The city that the request originated from. */
  city?: string

  /** The country that the request originated from. */
  country?: string

  /** The flag emoji for the country the request originated from. */
  flag?: string

  /** The region that received the request. */
  region?: string

  /** The region part of the ISO 3166-2 code of the client IP. */
  countryRegion?: string

  /** The latitude of the client. */
  latitude?: string

  /** The longitude of the client. */
  longitude?: string

  /** The postal code of the client */
  postalCode?: string
}

export function getGeolocation(headers: Headers): Geolocation {
  // Try to extract geolocation from common headers set by various providers
  // (Cloudflare, Vercel, Fastly, Netlify, etc.)
  const city =
    headers.get("x-vercel-ip-city") ||
    headers.get("x-fastly-ip-city") ||
    headers.get("x-nf-geo-city") ||
    headers.get("cf-ipcity") ||
    headers.get("cloudfront-viewer-city") ||
    headers.get("x-geo-city") ||
    undefined

  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("x-fastly-ip-country-code") ||
    headers.get("x-nf-geo-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-geo-country") ||
    undefined

  const region =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-fastly-ip-region") ||
    headers.get("x-nf-geo-region") ||
    headers.get("cf-region") ||
    headers.get("cloudfront-viewer-country-region") ||
    headers.get("x-geo-region") ||
    undefined

  const countryRegion =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-fastly-ip-region") ||
    headers.get("x-nf-geo-region") ||
    headers.get("cf-region") ||
    headers.get("cloudfront-viewer-country-region") ||
    undefined

  const latitude =
    headers.get("x-vercel-ip-latitude") ||
    headers.get("x-fastly-ip-lat") ||
    headers.get("x-nf-geo-latitude") ||
    headers.get("cf-iplatitude") ||
    headers.get("cloudfront-viewer-latitude") ||
    headers.get("x-geo-latitude") ||
    undefined

  const longitude =
    headers.get("x-vercel-ip-longitude") ||
    headers.get("x-fastly-ip-lon") ||
    headers.get("x-nf-geo-longitude") ||
    headers.get("cf-iplongitude") ||
    headers.get("cloudfront-viewer-longitude") ||
    headers.get("x-geo-longitude") ||
    undefined

  const postalCode =
    headers.get("x-vercel-ip-postal-code") ||
    headers.get("x-fastly-ip-postal-code") ||
    headers.get("x-nf-geo-postal-code") ||
    headers.get("cf-postal-code") ||
    headers.get("cloudfront-viewer-postal-code") ||
    headers.get("x-geo-postal-code") ||
    undefined

  // Try to get a flag emoji for the country, if available
  let flag: string | undefined
  if (country && country.length === 2) {
    // Convert country code to regional indicator symbols
    flag = String.fromCodePoint(
      ...country
        .toUpperCase()
        .split("")
        .map((c) => 0x1_f1_e6 + c.charCodeAt(0) - 65)
    )
  }

  return {
    city,
    country,
    flag,
    region,
    countryRegion,
    latitude,
    longitude,
    postalCode,
  }
}

export function getIp(headers: Headers): string | null {
  // Try various headers in order of preference (CDN-specific first, then
  // generic)
  const rawIp =
    headers.get("cf-connecting-ip") ??
    headers.get("true-client-ip") ??
    headers.get("fastly-client-ip") ??
    headers.get("x-client-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-cluster-client-ip") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-forwarded")

  if (!rawIp) {
    return null
  }

  // x-forwarded-for can contain comma-separated list: "client, proxy1, proxy2"
  // Extract first IP (the original client)
  const extractedIp = rawIp.split(",")[0]?.trim()

  if (!extractedIp) {
    return null
  }

  // Validate IP using zod
  const result = ip().safeParse(extractedIp)
  return result.success ? result.data : null
}
