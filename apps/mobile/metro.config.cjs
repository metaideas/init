"use strict"

const { getDefaultConfig } = require("expo/metro-config")
const { FileStore } = require("metro-cache")
const path = require("node:path")
const { withNativeWind } = require("nativewind/metro")
const { withSentryConfig } = require("@sentry/react-native/metro")

let config = getDefaultConfig(__dirname)

// Enable package exports and symlinks for workspace packages
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

// Configure cache location
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, ".cache/metro") }),
]

config = withNativeWind(config, {
  input: "./src/shared/assets/styles/globals.css",
  inlineRem: 16,
})

config = withSentryConfig(config)

module.exports = config
