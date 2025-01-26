import "server-only"

import { logger } from "@this/observability/logger"
import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
const FALLBACK_IP = "127.0.0.1"

export async function getIpAddress(request?: Request): Promise<string> {
  // Handle request-based IP detection
  if (request) {
    const detectedIp = ipAddress(request)

    if (detectedIp) {
      return detectedIp.trim()
    }

    logger.warn("No IP address found in request, using fallback")
    return FALLBACK_IP
  }

  // Handle headers-based IP detection
  const headersList = await headers()
  const forwardedForHeader = headersList.get("x-forwarded-for")
  const realIpHeader = headersList.get("x-real-ip")

  const forwardedForIp = forwardedForHeader?.split(",")[0]?.trim()

  if (forwardedForIp) {
    return forwardedForIp
  }

  if (realIpHeader) {
    return realIpHeader.trim()
  }

  logger.warn("No IP address found, using fallback")

  return FALLBACK_IP
}

export async function getGeolocation(request?: Request): Promise<{
  country: string | null
  city: string | null
  region: string | null
}> {
  if (request) {
    const geo = geolocation(request)

    return {
      country: geo.country ?? null,
      city: geo.city ?? null,
      region: geo.countryRegion ?? null,
    }
  }

  const headersList = await headers()
  const region = headersList.get("X-Vercel-IP-Country-Region")
  const country = headersList.get("X-Vercel-IP-Country")
  const city = headersList.get("X-Vercel-IP-City")

  return {
    country: country ? decodeURIComponent(country) : null,
    region: region ? decodeURIComponent(region) : null,
    city: city ? decodeURIComponent(city) : null,
  }
}
