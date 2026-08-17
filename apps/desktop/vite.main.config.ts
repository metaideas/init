import { defineConfig } from "vite"

// The package is `"type": "module"`, so the main bundle must be ES modules for
// Electron to load the `.js` file. Setting `build.lib` also stops the Forge
// Vite plugin from applying its CommonJS default.
export default defineConfig({
  build: {
    lib: {
      entry: "src/shell/main.ts",
      fileName: () => "[name].js",
      formats: ["es"],
    },
  },
})
