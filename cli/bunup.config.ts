import { defineConfig } from "bunup"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  external: ["@effect/platform-bun", "@octokit/rest", "effect", "giget"],
  minify: true,
  outDir: "dist",
  sourcemap: false,
  target: "bun",
})
