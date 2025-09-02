import { defineConfig } from "tsdown"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  minify: true,
  outDir: "dist",
  platform: "neutral",
  sourcemap: false,
  nodeProtocol: "strip",
})
