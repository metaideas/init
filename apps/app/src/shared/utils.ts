import { createUrlBuilder } from "@init/utils/url"
import { hasWindow } from "std-env"
import env from "#shared/env.ts"

const baseUrl = hasWindow ? globalThis.location.origin : (env.PORTLESS_URL ?? env.PUBLIC_BASE_URL)

export const buildUrl = createUrlBuilder(baseUrl, getProtocol(baseUrl))

const apiUrl = env.PUBLIC_API_URL ?? `${baseUrl}/api`
export const buildApiUrl = createUrlBuilder(apiUrl, getProtocol(apiUrl))

function getProtocol(url: string) {
  return new URL(url).protocol === "http:" ? "http" : "https"
}
