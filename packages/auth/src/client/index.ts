import type { Auth, BetterAuthClientPlugin } from "better-auth"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

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

/**
 * Creates a function to get the error message for a given locale and error code.
 *
 * @example
 * ```ts
 * const getErrorMessage = createErrorHandler(LOCALES, {
 *   ACCOUNT_NOT_FOUND: {
 *     en: "Account not found",
 *     es: "Cuenta no encontrada",
 *   },
 *   EMAIL_NOT_VERIFIED: {
 *     en: "Email not verified",
 *     es: "Correo electrónico no verificado",
 *   },
 * })
 *
 * getErrorMessage("en", "ACCOUNT_NOT_FOUND") // "Account not found"
 * getErrorMessage("es", "ACCOUNT_NOT_FOUND") // "Cuenta no encontrada"
 * getErrorMessage("en", "EMAIL_NOT_VERIFIED") // "Email not verified"
 * getErrorMessage("es", "EMAIL_NOT_VERIFIED") // "Correo electrónico no verificado"
 */
export function createErrorHandler<
  T extends string,
  K extends keyof ReturnType<typeof createAuthClient>["$ERROR_CODES"],
>(_locales: T[], errorCodes: Record<K, Partial<Record<T, string>>>) {
  return (locale: T, code: K) => errorCodes[code]?.[locale] ?? ""
}
