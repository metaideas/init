module.exports = (api) => {
  // oxlint-disable-next-line no-unsafe-call
  api.cache(true)
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  }
}
