import { createUrlBuilder } from "@init/utils/url"
import env from "#shared/env.ts"

const isProduction = import.meta.env.PROD

export const buildUrl = createUrlBuilder(env.PUBLIC_BASE_URL, isProduction ? "https" : "http")
