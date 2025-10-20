import { defineConfig } from "tsdown"

export default defineConfig({
  sourcemap: true,
  dts: {
    sourcemap: true,
  },
  entry: ["src/client.ts"],
  outDir: "dist",
  unbundle: true,
})
