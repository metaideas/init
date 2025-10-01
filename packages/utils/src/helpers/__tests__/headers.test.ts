import { describe, expect, test } from "bun:test"
import { getGeolocation, getIp } from "../headers"

describe("getIp", () => {
  test("returns null when no headers present", () => {
    const headers = new Headers()
    expect(getIp(headers)).toBeNull()
  })

  test("extracts IP from cf-connecting-ip (highest priority)", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.1",
      "x-forwarded-for": "198.51.100.1",
      "x-real-ip": "192.0.2.1",
    })
    expect(getIp(headers)).toBe("203.0.113.1")
  })

  test("extracts IP from true-client-ip", () => {
    const headers = new Headers({
      "true-client-ip": "203.0.113.2",
      "x-forwarded-for": "198.51.100.1",
    })
    expect(getIp(headers)).toBe("203.0.113.2")
  })

  test("extracts IP from fastly-client-ip", () => {
    const headers = new Headers({
      "fastly-client-ip": "203.0.113.3",
    })
    expect(getIp(headers)).toBe("203.0.113.3")
  })

  test("extracts IP from x-client-ip", () => {
    const headers = new Headers({
      "x-client-ip": "203.0.113.4",
    })
    expect(getIp(headers)).toBe("203.0.113.4")
  })

  test("extracts IP from x-real-ip", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.5",
    })
    expect(getIp(headers)).toBe("203.0.113.5")
  })

  test("extracts IP from x-cluster-client-ip", () => {
    const headers = new Headers({
      "x-cluster-client-ip": "203.0.113.6",
    })
    expect(getIp(headers)).toBe("203.0.113.6")
  })

  test("extracts first IP from x-forwarded-for comma-separated list", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 198.51.100.1, 192.0.2.1",
    })
    expect(getIp(headers)).toBe("203.0.113.7")
  })

  test("trims whitespace from extracted IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "  203.0.113.8  , 198.51.100.1",
    })
    expect(getIp(headers)).toBe("203.0.113.8")
  })

  test("validates IPv4 addresses", () => {
    const headers = new Headers({
      "x-real-ip": "192.168.1.1",
    })
    expect(getIp(headers)).toBe("192.168.1.1")
  })

  test("validates IPv6 addresses", () => {
    const headers = new Headers({
      "x-real-ip": "2001:db8:85a3::8a2e:370:7334",
    })
    expect(getIp(headers)).toBe("2001:db8:85a3::8a2e:370:7334")
  })

  test("returns null for invalid IP addresses", () => {
    const headers = new Headers({
      "x-real-ip": "not-an-ip-address",
    })
    expect(getIp(headers)).toBeNull()
  })

  test("returns null for malformed IP addresses", () => {
    const headers = new Headers({
      "x-real-ip": "999.999.999.999",
    })
    expect(getIp(headers)).toBeNull()
  })

  test("returns null for empty string after split", () => {
    const headers = new Headers({
      "x-forwarded-for": "",
    })
    expect(getIp(headers)).toBeNull()
  })

  test("handles localhost addresses", () => {
    const headers = new Headers({
      "x-real-ip": "127.0.0.1",
    })
    expect(getIp(headers)).toBe("127.0.0.1")
  })

  test("handles IPv6 localhost", () => {
    const headers = new Headers({
      "x-real-ip": "::1",
    })
    expect(getIp(headers)).toBe("::1")
  })
})

describe("getGeolocation", () => {
  test("returns empty object when no headers present", () => {
    const headers = new Headers()
    const result = getGeolocation(headers)
    expect(result).toEqual({
      city: undefined,
      country: undefined,
      flag: undefined,
      region: undefined,
      countryRegion: undefined,
      latitude: undefined,
      longitude: undefined,
      postalCode: undefined,
    })
  })

  test("extracts city from Vercel headers", () => {
    const headers = new Headers({
      "x-vercel-ip-city": "San Francisco",
    })
    const result = getGeolocation(headers)
    expect(result.city).toBe("San Francisco")
  })

  test("extracts city from Cloudflare headers", () => {
    const headers = new Headers({
      "cf-ipcity": "London",
    })
    const result = getGeolocation(headers)
    expect(result.city).toBe("London")
  })

  test("extracts city from CloudFront headers", () => {
    const headers = new Headers({
      "cloudfront-viewer-city": "Tokyo",
    })
    const result = getGeolocation(headers)
    expect(result.city).toBe("Tokyo")
  })

  test("extracts country from multiple providers", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "US",
    })
    const result = getGeolocation(headers)
    expect(result.country).toBe("US")
  })

  test("generates flag emoji from country code", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "US",
    })
    const result = getGeolocation(headers)
    expect(result.flag).toBe("🇺🇸")
  })

  test("generates flag emoji for different countries", () => {
    const headers1 = new Headers({ "cf-ipcountry": "GB" })
    expect(getGeolocation(headers1).flag).toBe("🇬🇧")

    const headers2 = new Headers({ "cf-ipcountry": "JP" })
    expect(getGeolocation(headers2).flag).toBe("🇯🇵")

    const headers3 = new Headers({ "cf-ipcountry": "DE" })
    expect(getGeolocation(headers3).flag).toBe("🇩🇪")
  })

  test("does not generate flag for non-2-letter country codes", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "USA",
    })
    const result = getGeolocation(headers)
    expect(result.flag).toBeUndefined()
  })

  test("extracts region from headers", () => {
    const headers = new Headers({
      "x-vercel-ip-country-region": "CA",
    })
    const result = getGeolocation(headers)
    expect(result.region).toBe("CA")
  })

  test("extracts latitude and longitude from Cloudflare", () => {
    const headers = new Headers({
      "cf-iplatitude": "37.7749",
      "cf-iplongitude": "-122.4194",
    })
    const result = getGeolocation(headers)
    expect(result.latitude).toBe("37.7749")
    expect(result.longitude).toBe("-122.4194")
  })

  test("extracts latitude and longitude from CloudFront", () => {
    const headers = new Headers({
      "cloudfront-viewer-latitude": "51.5074",
      "cloudfront-viewer-longitude": "-0.1278",
    })
    const result = getGeolocation(headers)
    expect(result.latitude).toBe("51.5074")
    expect(result.longitude).toBe("-0.1278")
  })

  test("extracts postal code from multiple providers", () => {
    const headers = new Headers({
      "x-vercel-ip-postal-code": "94102",
    })
    const result = getGeolocation(headers)
    expect(result.postalCode).toBe("94102")
  })

  test("prefers Vercel headers over others", () => {
    const headers = new Headers({
      "x-vercel-ip-city": "San Francisco",
      "cf-ipcity": "London",
      "cloudfront-viewer-city": "Tokyo",
    })
    const result = getGeolocation(headers)
    expect(result.city).toBe("San Francisco")
  })

  test("falls back through header chain", () => {
    const headers = new Headers({
      "cloudfront-viewer-city": "Paris",
      "x-geo-city": "Berlin",
    })
    const result = getGeolocation(headers)
    expect(result.city).toBe("Paris")
  })

  test("extracts all fields from Vercel headers", () => {
    const headers = new Headers({
      "x-vercel-ip-city": "New York",
      "x-vercel-ip-country": "US",
      "x-vercel-ip-country-region": "NY",
      "x-vercel-ip-latitude": "40.7128",
      "x-vercel-ip-longitude": "-74.0060",
      "x-vercel-ip-postal-code": "10001",
    })
    const result = getGeolocation(headers)
    expect(result).toEqual({
      city: "New York",
      country: "US",
      flag: "🇺🇸",
      region: "NY",
      countryRegion: "NY",
      latitude: "40.7128",
      longitude: "-74.0060",
      postalCode: "10001",
    })
  })

  test("extracts all fields from Cloudflare headers", () => {
    const headers = new Headers({
      "cf-ipcity": "Singapore",
      "cf-ipcountry": "SG",
      "cf-region": "01",
      "cf-iplatitude": "1.2897",
      "cf-iplongitude": "103.8501",
      "cf-postal-code": "018956",
    })
    const result = getGeolocation(headers)
    expect(result).toEqual({
      city: "Singapore",
      country: "SG",
      flag: "🇸🇬",
      region: "01",
      countryRegion: "01",
      latitude: "1.2897",
      longitude: "103.8501",
      postalCode: "018956",
    })
  })
})
