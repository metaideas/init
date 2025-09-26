export const isDevelopment = () =>
  import.meta.env
    ? import.meta.env.NODE_ENV === "development"
    : process.env.NODE_ENV === "development"

export const isProduction = () =>
  import.meta.env
    ? import.meta.env.NODE_ENV === "production"
    : process.env.NODE_ENV === "production"

export const isTest = () =>
  import.meta.env
    ? import.meta.env.NODE_ENV === "test"
    : process.env.NODE_ENV === "test"

export const isCI = () =>
  import.meta.env ? import.meta.env.CI === "true" : process.env.CI === "true"
