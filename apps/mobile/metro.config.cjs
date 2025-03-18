const { FileStore } = require("metro-cache")
const path = require("node:path")
const { withNativeWind } = require("nativewind/metro")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

let config = getSentryExpoConfig(__dirname)

// Enable package exports and symlinks for workspace packages
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

// Configure cache location
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, ".cache/metro") }),
]

config = withNativeWind(config, {
  input: "./src/shared/assets/styles/tailwind.css",
  configPath: "./tailwind.config.ts",
})

module.exports = config
