import { defineConfig } from "bunup"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  external: ["giget", "consola"],
  minify: true,
  outDir: "dist",
  sourcemap: false,
  target: "bun",
})
