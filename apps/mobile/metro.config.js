const { getDefaultConfig } = require("expo/metro-config")
const { withVarlockMetroConfig } = require("@varlock/expo-integration/metro-config")
const { withUniwindConfig } = require("uniwind/metro")

const config = getDefaultConfig(__dirname)

module.exports = withVarlockMetroConfig(
  withUniwindConfig(config, {
    cssEntryFile: "./src/shared/styles/globals.css",
    dtsFile: "./src/uniwind-types.d.ts",
  })
)
