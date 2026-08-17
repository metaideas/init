import { defineConfig } from "vite"

// Sandboxed preload scripts must be CommonJS. The `.cjs` extension keeps Node
// from reading the bundle as ES modules under this package's `"type": "module"`.
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "[name].cjs",
        entryFileNames: "[name].cjs",
      },
    },
  },
})
