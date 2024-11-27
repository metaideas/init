import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"

const FALLBACK_IP = "0.0.0.0"

export async function getIpAddress(request?: Request): Promise<string | null> {
  if (request) {
    const ip = ipAddress(request)

    if (!ip) {
      return FALLBACK_IP
    }

    return ip.trim()
  }

  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")

  const forwardedForIp = forwardedFor?.split(",")[0]?.trim()

  if (forwardedForIp) {
    return forwardedForIp
  }

  if (realIp) {
    return realIp.trim()
  }

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
