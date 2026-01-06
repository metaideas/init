module.exports = (api) => {
  // oxlint-disable-next-line no-unsafe-call
  api.cache(true)
  return {
    plugins: [["react-native-unistyles/plugin", { root: "src" }]],
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  }
}
