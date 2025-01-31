const { FileStore } = require("metro-cache")
const path = require("node:path")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

const config = getSentryExpoConfig(__dirname)

// Allows us to resolve exports in workspace packages and dependencies symlinked
// by pnpm
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

// Move the Metro cache to the `.cache/metro` folder. If you have any
// environment variables, you can configure Turborepo to invalidate it when
// needed. See: https://turbo.build/repo/docs/reference/configuration#env
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, ".cache/metro") }),
]

module.exports = config
