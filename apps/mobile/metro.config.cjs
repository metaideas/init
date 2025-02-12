const { FileStore } = require("metro-cache")
const path = require("node:path")
const { withNativeWind } = require("nativewind/metro")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

let config = getSentryExpoConfig(__dirname)

config = withNativeWind(config, {
  input: "./src/shared/assets/styles/tailwind.css",
  configPath: "./tailwind.config.ts",
})

// Enable package exports and symlinks for workspace packages
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true

// Enable resolving workspace packages
config.resolver.disableHierarchicalLookup = false
config.resolver.enableGlobalPackages = true

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..")

// Add workspace root to watch folders
config.watchFolders = [workspaceRoot]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

// Configure cache location
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, ".cache/metro") }),
]

module.exports = config
