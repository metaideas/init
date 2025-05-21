import type { Auth, BetterAuthClientPlugin } from "better-auth"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

import type { Locale } from "@init/utils/constants"

/**
 * Create a BetterAuth client.
 *
 * @param url - The URL of the BetterAuth server.
 * @returns The BetterAuth client.
 */
export function createAuthClient<Plugin extends BetterAuthClientPlugin>(
  url: string,
  plugins: Plugin[] = []
) {
  return createBetterAuthClient({
    baseURL: url,
    plugins: [inferAdditionalFields<Auth>(), ...plugins],
  })
}

export type AuthClient = ReturnType<typeof createAuthClient>

export type ErrorTypes = Partial<
  Record<
    keyof AuthClient["$ERROR_CODES"],
    {
      [key in Locale]: string
    }
  >
>

const errorCodes = {
  // Add your error codes here
} satisfies ErrorTypes

export const getErrorMessage = (code: string, locale: Locale) => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes][locale]
  }

  return ""
}
