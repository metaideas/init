export const isDevelopment = () => {
  try {
    if (typeof import.meta.env.DEV === "boolean") {
      return import.meta.env.DEV
    }

    if (typeof import.meta.env.NODE_ENV === "string") {
      return import.meta.env.NODE_ENV === "development"
    }
  } catch {
    // import.meta not available
  }

  return typeof process !== "undefined" && process.env.NODE_ENV === "development"
}

export function isProduction() {
  try {
    if (typeof import.meta.env.PROD === "boolean") {
      return import.meta.env.PROD
    }

    if (typeof import.meta.env.NODE_ENV === "string") {
      return import.meta.env.NODE_ENV === "production"
    }
  } catch {
    // import.meta not available
  }

  return typeof process !== "undefined" && process.env.NODE_ENV === "production"
}

export function isTest() {
  return (
    typeof process !== "undefined" &&
    typeof process.env.NODE_ENV === "string" &&
    process.env.NODE_ENV === "test"
  )
}

export function isCI() {
  return (
    typeof process !== "undefined" &&
    typeof process.env.CI === "string" &&
    process.env.CI === "true"
  )
}

export function isClient() {
  return (
    typeof globalThis !== "undefined" &&
    (globalThis as unknown as { window: unknown }).window !== undefined
  )
}

export function isServer() {
  return !isClient()
}
