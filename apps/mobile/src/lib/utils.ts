import { createUrlBuilder } from "@this/common/utils/url"
import env from "~/lib/env"

export const buildApiUrl = createUrlBuilder(env.EXPO_PUBLIC_SERVER_URL)
