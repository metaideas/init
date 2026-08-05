import { hasWindow } from "@init/utils/env"
import { createUrlBuilder } from "@init/utils/url"
import { ENV } from "#shared/env.generated.ts"

const baseUrl = hasWindow ? globalThis.location.origin : (ENV.PORTLESS_URL ?? ENV.PUBLIC_BASE_URL)

export const buildUrl = createUrlBuilder(baseUrl, getProtocol(baseUrl))

const apiUrl = ENV.PUBLIC_API_URL ?? `${baseUrl}/api`
export const buildApiUrl = createUrlBuilder(apiUrl, getProtocol(apiUrl))

function getProtocol(url: string) {
  return new URL(url).protocol === "http:" ? "http" : "https"
}
