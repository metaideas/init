/// <reference types="vite/client" />

export const isDevelopment = () => {
  try {
    return import.meta.env.DEV
  } catch {
    // import.meta not available
  }

  return (
    typeof process !== "undefined" && process.env.NODE_ENV === "development"
  )
}

export const isProduction = () => {
  try {
    return import.meta.env.PROD
  } catch {
    // import.meta not available
  }

  return typeof process !== "undefined" && process.env.NODE_ENV === "production"
}

export const isTest = () =>
  typeof process !== "undefined" && process.env.NODE_ENV === "test"

export const isCI = () =>
  typeof process !== "undefined" && process.env.CI === "true"
