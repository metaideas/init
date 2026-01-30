import { createUrlBuilder } from "@init/utils/url"
import env from "#shared/env.ts"

const isProduction = import.meta.env.PROD

export const buildApiUrl = createUrlBuilder(env.PUBLIC_API_URL, isProduction ? "https" : "http")
