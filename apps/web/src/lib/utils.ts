import { createUrlBuilder } from "@this/common/utils/url"
import env from "~/lib/env"

export const buildUrl = createUrlBuilder(env.NEXT_PUBLIC_DOMAIN)
