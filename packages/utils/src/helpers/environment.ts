/// <reference types="vite/client" />

export const isDevelopment = () =>
  import.meta.env ? import.meta.env.DEV : process.env.NODE_ENV === "development"

export const isProduction = () =>
  import.meta.env ? import.meta.env.PROD : process.env.NODE_ENV === "production"

export const isTest = () =>
  import.meta.env
    ? import.meta.env.TEST === "true"
    : process.env.NODE_ENV === "test"

export const isCI = () =>
  import.meta.env ? import.meta.env.CI === "true" : process.env.CI === "true"
