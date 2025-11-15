import { defineConfig } from "bunup"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  minify: true,
  outDir: "dist",
  target: "bun",
  sourcemap: false,
  external: ["giget", "consola"],
})
