const { FileStore } = require("metro-cache")
const path = require("node:path")
const { withNativeWind } = require("nativewind/metro")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

let config = getSentryExpoConfig(__dirname)

// XXX: Resolve our exports in workspace packages
// https://github.com/expo/expo/issues/26926
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

// Move the Metro cache to the `.cache/metro` folder. If you have any
// environment variables, you can configure Turborepo to invalidate it when
// needed. See: https://turbo.build/repo/docs/reference/configuration#env
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, ".cache/metro") }),
]

config = withNativeWind(config, {
  input: "./src/assets/styles/tailwind.css",
  configPath: "./tailwind.config.ts",
})

module.exports = config
